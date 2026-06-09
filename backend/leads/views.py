from django.utils import timezone
from rest_framework import decorators, response, viewsets

from .models import Lead, LeadActivity, LeadStage
from .serializers import LeadActivitySerializer, LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.select_related("customer", "assigned_to").prefetch_related("activities", "shortlisted_products").order_by("-updated_at")
    serializer_class = LeadSerializer
    search_fields = ["customer__full_name", "customer__mobile", "source", "interested_category", "notes"]
    filterset_fields = ["stage", "assigned_to", "source", "interested_category"]
    ordering_fields = ["created_at", "updated_at", "follow_up_date"]

    @decorators.action(detail=True, methods=["post"])
    def activities(self, request, pk=None):
        lead = self.get_object()
        serializer = LeadActivitySerializer(data={**request.data, "lead": lead.id})
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return response.Response(serializer.data, status=201)

    @decorators.action(detail=True, methods=["post"], url_path="close-won")
    def close_won(self, request, pk=None):
        lead = self.get_object()
        lead.stage = LeadStage.CLOSED_WON
        lead.save(update_fields=["stage", "updated_at"])
        LeadActivity.objects.create(lead=lead, user=request.user, activity_type="Note", note="Lead closed won.")
        return response.Response(self.get_serializer(lead).data)

    @decorators.action(detail=True, methods=["post"], url_path="close-lost")
    def close_lost(self, request, pk=None):
        lead = self.get_object()
        lead.stage = LeadStage.CLOSED_LOST
        lead.lost_reason = request.data.get("lost_reason", "")
        lead.save(update_fields=["stage", "lost_reason", "updated_at"])
        LeadActivity.objects.create(lead=lead, user=request.user, activity_type="Lost Reason Added", note=lead.lost_reason)
        return response.Response(self.get_serializer(lead).data)

    @decorators.action(detail=False, methods=["get"], url_path="overdue-follow-up")
    def overdue_follow_up(self, request):
        qs = self.get_queryset().filter(follow_up_date__lt=timezone.now()).exclude(stage__in=[LeadStage.CLOSED_WON, LeadStage.CLOSED_LOST])
        return response.Response(self.get_serializer(qs, many=True).data)


class LeadActivityViewSet(viewsets.ModelViewSet):
    queryset = LeadActivity.objects.select_related("lead", "user").order_by("-created_at")
    serializer_class = LeadActivitySerializer
    filterset_fields = ["lead", "user", "activity_type"]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
