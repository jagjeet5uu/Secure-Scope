from django.conf import settings
from django.db import models


class Task(models.Model):
    STATUS_CHOICES = [("Pending", "Pending"), ("Completed", "Completed"), ("Overdue", "Overdue"), ("Cancelled", "Cancelled")]
    PRIORITY_CHOICES = [("Low", "Low"), ("Medium", "Medium"), ("High", "High"), ("Urgent", "Urgent")]

    lead = models.ForeignKey("leads.Lead", null=True, blank=True, on_delete=models.CASCADE, related_name="tasks")
    customer = models.ForeignKey("customers.Customer", null=True, blank=True, on_delete=models.CASCADE, related_name="tasks")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default="Pending")
    priority = models.CharField(max_length=24, choices=PRIORITY_CHOICES, default="Medium")
    completion_note = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
