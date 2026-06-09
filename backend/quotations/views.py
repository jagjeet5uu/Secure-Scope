from django.utils import timezone
from rest_framework import decorators, response, viewsets

from products.models import InventoryStatus

from .models import Quotation, QuotationItem
from .serializers import QuotationItemSerializer, QuotationSerializer


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.select_related("customer", "lead", "created_by").prefetch_related("items").order_by("-created_at")
    serializer_class = QuotationSerializer
    filterset_fields = ["status", "customer", "lead", "created_by"]
    search_fields = ["quotation_number", "customer__full_name", "customer__mobile", "zoho_estimate_id", "zoho_invoice_id"]

    def perform_create(self, serializer):
        if not serializer.validated_data.get("quotation_number"):
            serializer.validated_data["quotation_number"] = f"QTN-{timezone.now():%Y%m%d%H%M%S}"
        serializer.save(created_by=self.request.user)

    @decorators.action(detail=True, methods=["post"])
    def items(self, request, pk=None):
        quotation = self.get_object()
        serializer = QuotationItemSerializer(data={**request.data, "quotation": quotation.id})
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        if product.inventory_status == InventoryStatus.RESERVED and product.reserved_customer_id != quotation.customer_id:
            return response.Response({"detail": "Product is reserved for another customer."}, status=400)
        serializer.save(item_name=product.item_name, sku=product.sku or "", unit_price=serializer.validated_data.get("unit_price") or product.selling_price)
        return response.Response(serializer.data, status=201)

    @decorators.action(detail=True, methods=["post"], url_path="generate-pdf")
    def generate_pdf(self, request, pk=None):
        quotation = self.get_object()
        return response.Response({"detail": "PDF generation job queued.", "quotation_id": quotation.id})

    @decorators.action(detail=True, methods=["post"], url_path="convert-to-zoho-estimate")
    def convert_to_zoho_estimate(self, request, pk=None):
        quotation = self.get_object()
        quotation.status = "Sent"
        quotation.zoho_estimate_id = request.data.get("zoho_estimate_id", quotation.zoho_estimate_id)
        quotation.save(update_fields=["status", "zoho_estimate_id", "updated_at"])
        return response.Response(self.get_serializer(quotation).data)

    @decorators.action(detail=True, methods=["post"], url_path="convert-to-zoho-invoice")
    def convert_to_zoho_invoice(self, request, pk=None):
        quotation = self.get_object()
        quotation.status = "Converted to Invoice"
        quotation.zoho_invoice_id = request.data.get("zoho_invoice_id", quotation.zoho_invoice_id)
        quotation.save(update_fields=["status", "zoho_invoice_id", "updated_at"])
        for item in quotation.items.select_related("product"):
            item.product.inventory_status = InventoryStatus.SOLD
            item.product.save(update_fields=["inventory_status", "updated_at"])
        return response.Response(self.get_serializer(quotation).data)
