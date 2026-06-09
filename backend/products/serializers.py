from rest_framework import serializers

from .constants import normalize_category, normalize_certification, normalize_inventory
from .models import Product, ProductCertificate, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = "__all__"
        read_only_fields = ["id", "uploaded_by", "created_at"]


class ProductCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCertificate
        fields = "__all__"
        read_only_fields = ["id", "uploaded_by", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    certificates = ProductCertificateSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "reserved_customer", "reserved_until"]

    def validate(self, attrs):
        if "category" in attrs:
            attrs["category"] = normalize_category(attrs.get("category"))
        if "certification_type" in attrs:
            attrs["certification_type"] = normalize_certification(attrs.get("certification_type"))
        if "inventory_status" in attrs:
            attrs["inventory_status"] = normalize_inventory(attrs.get("inventory_status"))
        return attrs
