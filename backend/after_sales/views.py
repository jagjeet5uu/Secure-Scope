from rest_framework import decorators, response, viewsets

from .models import AfterSalesImage, AfterSalesRequest
from .serializers import AfterSalesImageSerializer, AfterSalesRequestSerializer


class AfterSalesRequestViewSet(viewsets.ModelViewSet):
    queryset = AfterSalesRequest.objects.select_related("customer", "product", "assigned_staff").prefetch_related("images").order_by("-created_at")
    serializer_class = AfterSalesRequestSerializer
    filterset_fields = ["status", "request_type", "assigned_staff", "customer", "product"]
    search_fields = ["customer__full_name", "customer__mobile", "product__sku", "invoice_id", "notes"]

    @decorators.action(detail=True, methods=["post"], url_path="before-images")
    def before_images(self, request, pk=None):
        service_request = self.get_object()
        serializer = AfterSalesImageSerializer(data={**request.data, "request": service_request.id, "image_type": "before"})
        serializer.is_valid(raise_exception=True)
        serializer.save(uploaded_by=request.user)
        return response.Response(serializer.data, status=201)

    @decorators.action(detail=True, methods=["post"], url_path="after-images")
    def after_images(self, request, pk=None):
        service_request = self.get_object()
        serializer = AfterSalesImageSerializer(data={**request.data, "request": service_request.id, "image_type": "after"})
        serializer.is_valid(raise_exception=True)
        serializer.save(uploaded_by=request.user)
        return response.Response(serializer.data, status=201)
