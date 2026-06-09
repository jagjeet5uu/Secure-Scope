from django.conf import settings
from django.db import models


class Customer(models.Model):
    zoho_contact_id = models.CharField(max_length=128, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120, blank=True)
    full_name = models.CharField(max_length=255, blank=True)
    mobile = models.CharField(max_length=32, unique=True, null=True, blank=True)
    email = models.EmailField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    address = models.TextField(blank=True)
    customer_type = models.CharField(max_length=80, blank=True)
    lead_source = models.CharField(max_length=120, blank=True)
    birthday = models.DateField(null=True, blank=True)
    anniversary = models.DateField(null=True, blank=True)
    preferred_category = models.CharField(max_length=120, blank=True)
    preferred_metal = models.CharField(max_length=80, blank=True)
    preferred_budget_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    preferred_budget_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ring_size = models.CharField(max_length=40, blank=True)
    bracelet_size = models.CharField(max_length=40, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["full_name"]),
            models.Index(fields=["mobile"]),
            models.Index(fields=["email"]),
        ]

    def save(self, *args, **kwargs):
        self.full_name = " ".join(part for part in [self.first_name, self.last_name] if part).strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name or self.mobile or str(self.pk)
