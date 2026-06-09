from rest_framework import decorators, response, viewsets

from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.select_related("created_by").order_by("-created_at")
    serializer_class = CustomerSerializer
    search_fields = ["first_name", "last_name", "full_name", "mobile", "email", "city"]
    filterset_fields = ["customer_type", "lead_source", "preferred_category", "preferred_metal"]
    ordering_fields = ["created_at", "updated_at", "full_name"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @decorators.action(detail=True, methods=["get"])
    def leads(self, request, pk=None):
        customer = self.get_object()
        data = [{"id": lead.id, "stage": lead.stage, "source": lead.source, "created_at": lead.created_at} for lead in customer.leads.all()]
        return response.Response(data)

    @decorators.action(detail=True, methods=["get"])
    def reservations(self, request, pk=None):
        customer = self.get_object()
        data = [{"id": item.id, "product": item.product_id, "status": item.status, "reserved_until": item.reserved_until} for item in customer.reservations.all()]
        return response.Response(data)
