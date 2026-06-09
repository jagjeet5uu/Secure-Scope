import csv
from io import TextIOWrapper

from django.db import transaction

from imports.models import ImportLog, ImportLogItem

from .constants import normalize_category, normalize_certification, normalize_inventory, parse_money
from .models import Product


FIELD_MAP = {
    "Zoho Item ID": "zoho_item_id",
    "Item ID": "zoho_item_id",
    "Item Name": "item_name",
    "Name": "item_name",
    "SKU": "sku",
    "Description": "description",
    "Rate": "selling_price",
    "Purchase Rate": "purchase_price",
    "Status": "is_active",
    "CF.Product Type": "category",
    "CF.Date of Purchase": "date_of_purchase",
    "CF.Certification present?": "certification_type",
    "CF.Inventory": "inventory_status",
}


def csv_value(row, *names):
    for name in names:
        if name in row and row[name] not in (None, ""):
            return row[name]
    return ""


def import_zoho_items_csv(file_obj, created_by=None):
    import_log = ImportLog.objects.create(created_by=created_by, status="processing")
    wrapper = TextIOWrapper(file_obj, encoding="utf-8-sig")
    reader = csv.DictReader(wrapper)
    seen_skus = set()
    summary = {
        "total_rows": 0,
        "imported_rows": 0,
        "skipped_rows": 0,
        "missing_sku_count": 0,
        "duplicate_sku_count": 0,
        "missing_certification_count": 0,
        "invalid_price_count": 0,
    }

    with transaction.atomic():
        for index, row in enumerate(reader, start=2):
            summary["total_rows"] += 1
            sku = str(csv_value(row, "SKU")).strip() or None
            if not sku:
                summary["missing_sku_count"] += 1
            if sku and sku in seen_skus:
                summary["duplicate_sku_count"] += 1
                summary["skipped_rows"] += 1
                ImportLogItem.objects.create(import_log=import_log, row_number=index, status="skipped", error_message="Duplicate SKU in import file", raw_data=row)
                continue
            if sku:
                seen_skus.add(sku)

            certification = normalize_certification(csv_value(row, "CF.Certification present?"))
            if certification in {"Unknown", "No"}:
                summary["missing_certification_count"] += 1

            try:
                selling_price = parse_money(csv_value(row, "Rate"))
                purchase_price = parse_money(csv_value(row, "Purchase Rate"))
            except ValueError as exc:
                summary["invalid_price_count"] += 1
                summary["skipped_rows"] += 1
                ImportLogItem.objects.create(import_log=import_log, row_number=index, status="failed", error_message=str(exc), raw_data=row)
                continue

            defaults = {
                "item_name": csv_value(row, "Item Name", "Name") or sku or "Unnamed Item",
                "description": csv_value(row, "Description"),
                "selling_price": selling_price,
                "purchase_price": purchase_price,
                "is_active": str(csv_value(row, "Status")).strip().lower() != "inactive",
                "category": normalize_category(csv_value(row, "CF.Product Type")),
                "certification_type": certification,
                "inventory_status": normalize_inventory(csv_value(row, "CF.Inventory")),
            }
            zoho_item_id = csv_value(row, "Zoho Item ID", "Item ID") or None
            if zoho_item_id:
                defaults["zoho_item_id"] = zoho_item_id

            lookup = {"sku": sku} if sku else {"zoho_item_id": zoho_item_id}
            if not any(lookup.values()):
                summary["skipped_rows"] += 1
                ImportLogItem.objects.create(import_log=import_log, row_number=index, status="skipped", error_message="Missing SKU and Zoho Item ID", raw_data=row)
                continue

            Product.objects.update_or_create(**lookup, defaults=defaults)
            summary["imported_rows"] += 1
            ImportLogItem.objects.create(import_log=import_log, row_number=index, status="imported", raw_data=row)

    for key, value in summary.items():
        setattr(import_log, key, value)
    import_log.status = "completed"
    import_log.save()
    return import_log
