from rest_framework import decorators, response, status, viewsets
from rest_framework.views import APIView

from .models import WebhookLog, ZohoSyncLog
from .serializers import WebhookLogSerializer, ZohoSyncLogSerializer
from .tasks import process_zoho_webhook, retry_failed_sync


class SyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ZohoSyncLog.objects.order_by("-created_at")
    serializer_class = ZohoSyncLogSerializer
    filterset_fields = ["module", "status", "direction"]
    search_fields = ["zoho_id", "local_id", "error_message"]

    @decorators.action(detail=True, methods=["post"])
    def retry(self, request, pk=None):
        retry_failed_sync.delay(self.get_object().id)
        return response.Response({"detail": "Retry queued."})


class ZohoActionViewSet(viewsets.ViewSet):
    @decorators.action(detail=False, methods=["post"], url_path="create-invoice")
    def create_invoice(self, request):
        return response.Response({"detail": "Zoho invoice creation job queued."}, status=status.HTTP_202_ACCEPTED)

    @decorators.action(detail=False, methods=["post"], url_path="create-estimate")
    def create_estimate(self, request):
        return response.Response({"detail": "Zoho estimate creation job queued."}, status=status.HTTP_202_ACCEPTED)

    @decorators.action(detail=False, methods=["post"], url_path="sync-items")
    def sync_items(self, request):
        return response.Response({"detail": "Zoho item sync job queued."}, status=status.HTTP_202_ACCEPTED)

    @decorators.action(detail=False, methods=["post"], url_path="sync-contacts")
    def sync_contacts(self, request):
        return response.Response({"detail": "Zoho contact sync job queued."}, status=status.HTTP_202_ACCEPTED)

    @decorators.action(detail=False, methods=["post"], url_path="sync-invoices")
    def sync_invoices(self, request):
        return response.Response({"detail": "Zoho invoice sync job queued."}, status=status.HTTP_202_ACCEPTED)


class ZohoWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, event_type):
        webhook = WebhookLog.objects.create(event_type=event_type, payload=request.data)
        process_zoho_webhook.delay(webhook.id)
        return response.Response(WebhookLogSerializer(webhook).data, status=status.HTTP_202_ACCEPTED)
