from django.conf import settings
from django.db import models


class ImportLog(models.Model):
    status = models.CharField(max_length=32, default="pending")
    total_rows = models.PositiveIntegerField(default=0)
    imported_rows = models.PositiveIntegerField(default=0)
    skipped_rows = models.PositiveIntegerField(default=0)
    missing_sku_count = models.PositiveIntegerField(default=0)
    duplicate_sku_count = models.PositiveIntegerField(default=0)
    missing_certification_count = models.PositiveIntegerField(default=0)
    invalid_price_count = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def summary(self):
        return {
            "total_rows": self.total_rows,
            "imported_rows": self.imported_rows,
            "skipped_rows": self.skipped_rows,
            "missing_sku_count": self.missing_sku_count,
            "duplicate_sku_count": self.duplicate_sku_count,
            "missing_certification_count": self.missing_certification_count,
            "invalid_price_count": self.invalid_price_count,
        }


class ImportLogItem(models.Model):
    import_log = models.ForeignKey(ImportLog, on_delete=models.CASCADE, related_name="items")
    row_number = models.PositiveIntegerField()
    status = models.CharField(max_length=32)
    error_message = models.TextField(blank=True)
    raw_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
