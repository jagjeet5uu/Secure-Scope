from rest_framework import serializers

from .models import WebhookLog, ZohoSyncLog


class ZohoSyncLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZohoSyncLog
        fields = "__all__"


class WebhookLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookLog
        fields = "__all__"
