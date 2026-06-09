from django.conf import settings
from django.db import models


class LeadStage(models.TextChoices):
    NEW = "New Inquiry", "New Inquiry"
    CONTACTED = "Contacted", "Contacted"
    REQUIREMENT_COLLECTED = "Requirement Collected", "Requirement Collected"
    PRODUCTS_SHARED = "Products Shared", "Products Shared"
    SHORTLISTED = "Shortlisted", "Shortlisted"
    RESERVED = "Reserved", "Reserved"
    QUOTATION_SENT = "Quotation Sent", "Quotation Sent"
    ADVANCE_PAID = "Advance Paid", "Advance Paid"
    INVOICE_CREATED = "Invoice Created", "Invoice Created"
    DELIVERED = "Delivered", "Delivered"
    CLOSED_WON = "Closed Won", "Closed Won"
    CLOSED_LOST = "Closed Lost", "Closed Lost"


class Lead(models.Model):
    customer = models.ForeignKey("customers.Customer", on_delete=models.CASCADE, related_name="leads")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_leads")
    source = models.CharField(max_length=120, blank=True)
    stage = models.CharField(max_length=40, choices=LeadStage.choices, default=LeadStage.NEW)
    interested_category = models.CharField(max_length=120, blank=True)
    budget_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    occasion = models.CharField(max_length=120, blank=True)
    required_date = models.DateField(null=True, blank=True)
    follow_up_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    lost_reason = models.TextField(blank=True)
    shortlisted_products = models.ManyToManyField("products.Product", blank=True, related_name="shortlisted_leads")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["stage"]), models.Index(fields=["follow_up_date"])]


class LeadActivity(models.Model):
    ACTIVITY_TYPES = [
        ("Call", "Call"),
        ("Meeting", "Meeting"),
        ("Product Shared", "Product Shared"),
        ("Customer Visit", "Customer Visit"),
        ("Follow-up", "Follow-up"),
        ("Note", "Note"),
        ("Quotation Sent", "Quotation Sent"),
        ("Reservation Created", "Reservation Created"),
        ("Invoice Created", "Invoice Created"),
        ("Lost Reason Added", "Lost Reason Added"),
    ]
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="activities")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    activity_type = models.CharField(max_length=40, choices=ACTIVITY_TYPES)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
