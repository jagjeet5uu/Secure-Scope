from django.utils import timezone
from rest_framework import decorators, response, viewsets

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related("lead", "customer", "assigned_to").order_by("due_date")
    serializer_class = TaskSerializer
    search_fields = ["title", "description", "customer__full_name", "lead__notes"]
    filterset_fields = ["status", "priority", "assigned_to", "lead", "customer"]
    ordering_fields = ["due_date", "priority", "created_at"]

    @decorators.action(detail=False, methods=["get"], url_path="today")
    def today(self, request):
        start = timezone.localdate()
        qs = self.get_queryset().filter(due_date__date=start, assigned_to=request.user).exclude(status="Completed")
        return response.Response(self.get_serializer(qs, many=True).data)

    @decorators.action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = "Completed"
        task.completed_at = timezone.now()
        task.completion_note = request.data.get("note", "")
        task.save(update_fields=["status", "completed_at", "completion_note", "updated_at"])
        return response.Response(self.get_serializer(task).data)
