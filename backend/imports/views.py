from rest_framework import viewsets

from .models import ImportLog
from .serializers import ImportLogSerializer


class ImportLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImportLog.objects.prefetch_related("items").order_by("-created_at")
    serializer_class = ImportLogSerializer
    filterset_fields = ["status"]
