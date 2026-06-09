from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from products.models import Product

from .models import ProductReservation


class ProductReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReservation
        fields = "__all__"
        read_only_fields = ["id", "reserved_by", "reserved_at", "created_at", "updated_at"]

    def create(self, validated_data):
        try:
            return ProductReservation.create_active(reserved_by=self.context["request"].user, **validated_data)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"product": exc.messages})
