from django.conf import settings
from django.db import models


class Quotation(models.Model):
    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Sent", "Sent"),
        ("Accepted", "Accepted"),
        ("Rejected", "Rejected"),
        ("Converted to Invoice", "Converted to Invoice"),
        ("Cancelled", "Cancelled"),
    ]
    quotation_number = models.CharField(max_length=40, unique=True)
    customer = models.ForeignKey("customers.Customer", on_delete=models.CASCADE, related_name="quotations")
    lead = models.ForeignKey("leads.Lead", null=True, blank=True, on_delete=models.SET_NULL, related_name="quotations")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="Draft")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    zoho_estimate_id = models.CharField(max_length=128, blank=True)
    zoho_invoice_id = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def recalculate(self):
        subtotal = sum(item.total for item in self.items.all())
        self.subtotal = subtotal
        self.total = subtotal - self.discount + self.tax
        self.save(update_fields=["subtotal", "total", "updated_at"])


class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.PROTECT, related_name="quotation_items")
    item_name = models.CharField(max_length=255)
    sku = models.CharField(max_length=128, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.item_name = self.item_name or self.product.item_name
        self.sku = self.sku or self.product.sku or ""
        self.total = (self.unit_price * self.quantity) - self.discount + self.tax
        super().save(*args, **kwargs)
        self.quotation.recalculate()
