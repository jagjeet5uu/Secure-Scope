from rest_framework import decorators, response, status, viewsets

from .models import InventoryStatus, Product, ProductCertificate, ProductImage
from .serializers import ProductCertificateSerializer, ProductImageSerializer, ProductSerializer
from .services import import_zoho_items_csv


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.prefetch_related("images", "certificates").order_by("-updated_at")
    serializer_class = ProductSerializer
    search_fields = ["sku", "item_name", "description", "certification_number"]
    filterset_fields = ["category", "subcategory", "metal_type", "metal_purity", "certification_type", "inventory_status", "is_active"]
    ordering_fields = ["selling_price", "purchase_price", "gross_weight", "date_of_purchase", "updated_at"]

    @decorators.action(detail=False, methods=["post"], url_path="import-csv")
    def import_csv(self, request):
        upload = request.FILES.get("file")
        if not upload:
            return response.Response({"detail": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)
        import_log = import_zoho_items_csv(upload.file, created_by=request.user)
        return response.Response({"id": import_log.id, "summary": import_log.summary}, status=status.HTTP_201_CREATED)

    @decorators.action(detail=False, methods=["get"], url_path="missing-sku")
    def missing_sku(self, request):
        return response.Response(ProductSerializer(self.get_queryset().filter(sku__isnull=True), many=True).data)

    @decorators.action(detail=False, methods=["get"], url_path="missing-certification")
    def missing_certification(self, request):
        qs = self.get_queryset().filter(certification_type__in=["Unknown", "No"])
        return response.Response(ProductSerializer(qs, many=True).data)

    @decorators.action(detail=False, methods=["get"])
    def available(self, request):
        return response.Response(ProductSerializer(self.get_queryset().filter(inventory_status=InventoryStatus.AVAILABLE), many=True).data)

    @decorators.action(detail=False, methods=["get"])
    def reserved(self, request):
        return response.Response(ProductSerializer(self.get_queryset().filter(inventory_status=InventoryStatus.RESERVED), many=True).data)

    @decorators.action(detail=False, methods=["get"])
    def sold(self, request):
        return response.Response(ProductSerializer(self.get_queryset().filter(inventory_status=InventoryStatus.SOLD), many=True).data)


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.select_related("product", "uploaded_by").order_by("-created_at")
    serializer_class = ProductImageSerializer
    filterset_fields = ["product", "is_primary"]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class ProductCertificateViewSet(viewsets.ModelViewSet):
    queryset = ProductCertificate.objects.select_related("product", "uploaded_by").order_by("-created_at")
    serializer_class = ProductCertificateSerializer
    filterset_fields = ["product", "certificate_type"]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
