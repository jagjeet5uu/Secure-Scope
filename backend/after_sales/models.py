from django.conf import settings
from django.db import models


class AfterSalesRequest(models.Model):
    REQUEST_TYPES = [
        ("Resize", "Resize"),
        ("Repair", "Repair"),
        ("Polish", "Polish"),
        ("Stone Replacement", "Stone Replacement"),
        ("Certificate Issue", "Certificate Issue"),
        ("Exchange", "Exchange"),
        ("Return", "Return"),
        ("Cleaning", "Cleaning"),
        ("Custom Modification", "Custom Modification"),
    ]
    STATUS_CHOICES = [
        ("Received", "Received"),
        ("Inspection", "Inspection"),
        ("In Progress", "In Progress"),
        ("Ready", "Ready"),
        ("Delivered", "Delivered"),
        ("Closed", "Closed"),
        ("Cancelled", "Cancelled"),
    ]
    customer = models.ForeignKey("customers.Customer", on_delete=models.CASCADE, related_name="after_sales_requests")
    product = models.ForeignKey("products.Product", null=True, blank=True, on_delete=models.SET_NULL, related_name="after_sales_requests")
    invoice_id = models.CharField(max_length=128, blank=True)
    request_type = models.CharField(max_length=40, choices=REQUEST_TYPES)
    received_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    delivered_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="Received")
    assigned_staff = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AfterSalesImage(models.Model):
    request = models.ForeignKey(AfterSalesRequest, on_delete=models.CASCADE, related_name="images")
    image_type = models.CharField(max_length=16, choices=[("before", "Before"), ("after", "After")])
    file_url = models.URLField(max_length=1024)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
