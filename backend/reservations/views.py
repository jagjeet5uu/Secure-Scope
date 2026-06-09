from django.utils import timezone
from rest_framework import decorators, response, viewsets

from .models import ProductReservation, ReservationStatus
from .serializers import ProductReservationSerializer


class ProductReservationViewSet(viewsets.ModelViewSet):
    queryset = ProductReservation.objects.select_related("product", "customer", "lead", "reserved_by").order_by("-created_at")
    serializer_class = ProductReservationSerializer
    filterset_fields = ["status", "customer", "lead", "reserved_by", "product"]
    search_fields = ["product__sku", "product__item_name", "customer__full_name", "customer__mobile"]
    ordering_fields = ["reserved_until", "reserved_at", "created_at"]

    @decorators.action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        reservation = self.get_object().release(ReservationStatus.CANCELLED)
        return response.Response(self.get_serializer(reservation).data)

    @decorators.action(detail=True, methods=["post"])
    def extend(self, request, pk=None):
        reservation = self.get_object()
        reservation.reserved_until = request.data["reserved_until"]
        reservation.save(update_fields=["reserved_until", "updated_at"])
        reservation.product.reserved_until = reservation.reserved_until
        reservation.product.save(update_fields=["reserved_until", "updated_at"])
        return response.Response(self.get_serializer(reservation).data)

    @decorators.action(detail=True, methods=["post"], url_path="convert-to-sale")
    def convert_to_sale(self, request, pk=None):
        reservation = self.get_object()
        reservation.status = ReservationStatus.CONVERTED
        reservation.save(update_fields=["status", "updated_at"])
        return response.Response(self.get_serializer(reservation).data)

    @decorators.action(detail=False, methods=["get"], url_path="expiring-today")
    def expiring_today(self, request):
        today = timezone.localdate()
        qs = self.get_queryset().filter(status=ReservationStatus.ACTIVE, reserved_until__date=today)
        return response.Response(self.get_serializer(qs, many=True).data)
