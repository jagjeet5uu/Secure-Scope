from django.conf import settings
from django.db import models


class InventoryStatus(models.TextChoices):
    AVAILABLE = "Available", "Available"
    RESERVED = "Reserved", "Reserved"
    SOLD = "Sold", "Sold"
    RETURNED = "Returned", "Returned"
    UNDER_SERVICE = "Under Service", "Under Service"
    ARCHIVED = "Archived", "Archived"


class Product(models.Model):
    zoho_item_id = models.CharField(max_length=128, unique=True, null=True, blank=True)
    item_name = models.CharField(max_length=255)
    sku = models.CharField(max_length=128, unique=True, null=True, blank=True)
    category = models.CharField(max_length=120, blank=True)
    subcategory = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_weight = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    net_weight = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    diamond_weight = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    metal_type = models.CharField(max_length=80, blank=True)
    metal_purity = models.CharField(max_length=80, blank=True)
    stone_type = models.CharField(max_length=120, blank=True)
    certification_type = models.CharField(max_length=80, default="Unknown")
    certification_number = models.CharField(max_length=128, blank=True)
    inventory_status = models.CharField(max_length=32, choices=InventoryStatus.choices, default=InventoryStatus.AVAILABLE)
    crm_status = models.CharField(max_length=32, blank=True)
    date_of_purchase = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    making_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    margin = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reserved_customer = models.ForeignKey("customers.Customer", null=True, blank=True, on_delete=models.SET_NULL, related_name="reserved_products")
    reserved_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["sku"]),
            models.Index(fields=["category"]),
            models.Index(fields=["inventory_status"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return f"{self.sku or 'NO-SKU'} - {self.item_name}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    file_url = models.URLField(max_length=1024)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=80)
    is_primary = models.BooleanField(default=False)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)


class ProductCertificate(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="certificates")
    certificate_type = models.CharField(max_length=80)
    certificate_number = models.CharField(max_length=128, blank=True)
    file_url = models.URLField(max_length=1024)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
