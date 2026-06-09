from datetime import timedelta
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from customers.models import Customer
from products.constants import normalize_certification, normalize_inventory
from products.models import InventoryStatus, Product
from products.services import import_zoho_items_csv
from reservations.models import ProductReservation


class NormalizationTests(TestCase):
    def test_normalizes_zoho_custom_values(self):
        self.assertEqual(normalize_inventory("in stock"), "Available")
        self.assertEqual(normalize_inventory("return"), "Returned")
        self.assertEqual(normalize_certification("IGI"), "IGI")
        self.assertEqual(normalize_certification(""), "Unknown")


class ReservationRuleTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="admin", password="password", role="admin")
        self.customer = Customer.objects.create(first_name="Asha", mobile="9999999999")
        self.product = Product.objects.create(item_name="Diamond Ring", sku="DR-1", inventory_status=InventoryStatus.AVAILABLE)

    def test_only_available_products_can_be_reserved(self):
        ProductReservation.create_active(
            product=self.product,
            customer=self.customer,
            reserved_by=self.user,
            reserved_until=timezone.now() + timedelta(days=1),
        )
        self.product.refresh_from_db()
        self.assertEqual(self.product.inventory_status, InventoryStatus.RESERVED)
        with self.assertRaises(ValidationError):
            ProductReservation.create_active(
                product=self.product,
                customer=self.customer,
                reserved_by=self.user,
                reserved_until=timezone.now() + timedelta(days=1),
            )


class CsvImportTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="admin", password="password", role="admin")

    def test_imports_zoho_item_export(self):
        data = b"Zoho Item ID,Item Name,SKU,Rate,Purchase Rate,Status,CF.Product Type,CF.Certification present?,CF.Inventory\nZ1,Ring A,SKU-1,1000,700,Active,Ring,IGI,Available\n"
        log = import_zoho_items_csv(BytesIO(data), created_by=self.user)
        self.assertEqual(log.imported_rows, 1)
        product = Product.objects.get(sku="SKU-1")
        self.assertEqual(product.category, "Rings")
        self.assertEqual(product.certification_type, "IGI")
