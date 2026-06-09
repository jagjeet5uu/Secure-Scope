from django.db import models


class ZohoToken(models.Model):
    access_token = models.TextField(blank=True)
    refresh_token_secret_name = models.CharField(max_length=255, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ZohoSyncLog(models.Model):
    module = models.CharField(max_length=80)
    zoho_id = models.CharField(max_length=128, blank=True)
    local_id = models.CharField(max_length=128, blank=True)
    direction = models.CharField(max_length=24, choices=[("zoho_to_crm", "Zoho to CRM"), ("crm_to_zoho", "CRM to Zoho")])
    status = models.CharField(max_length=24, choices=[("pending", "Pending"), ("success", "Success"), ("failed", "Failed"), ("retrying", "Retrying")], default="pending")
    request_payload = models.JSONField(default=dict, blank=True)
    response_payload = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["module", "status"]), models.Index(fields=["created_at"])]


class WebhookLog(models.Model):
    source = models.CharField(max_length=80, default="zoho")
    event_type = models.CharField(max_length=120)
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=24, default="pending")
    error_message = models.TextField(blank=True)
    received_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["event_type", "status"])]
