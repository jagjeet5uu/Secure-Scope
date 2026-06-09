from rest_framework import serializers

from .models import AfterSalesImage, AfterSalesRequest


class AfterSalesImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AfterSalesImage
        fields = "__all__"
        read_only_fields = ["id", "uploaded_by", "created_at"]


class AfterSalesRequestSerializer(serializers.ModelSerializer):
    images = AfterSalesImageSerializer(many=True, read_only=True)

    class Meta:
        model = AfterSalesRequest
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]
