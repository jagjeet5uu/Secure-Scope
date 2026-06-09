from rest_framework import serializers

from .models import ImportLog, ImportLogItem


class ImportLogItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportLogItem
        fields = "__all__"


class ImportLogSerializer(serializers.ModelSerializer):
    items = ImportLogItemSerializer(many=True, read_only=True)
    summary = serializers.DictField(read_only=True)

    class Meta:
        model = ImportLog
        fields = "__all__"
