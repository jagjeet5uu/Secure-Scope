from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from leads.models import Lead
from products.models import InventoryStatus, Product
from reservations.models import ProductReservation, ReservationStatus
from tasks_app.models import Task
from zoho_integration.models import ZohoSyncLog


class DashboardReportView(APIView):
    def get(self, request):
        today = timezone.localdate()
        product_counts = Product.objects.values("inventory_status").annotate(count=Count("id"))
        leads_by_stage = Lead.objects.values("stage").annotate(count=Count("id")).order_by("stage")
        return Response(
            {
                "total_products": Product.objects.count(),
                "available_products": Product.objects.filter(inventory_status=InventoryStatus.AVAILABLE).count(),
                "reserved_products": Product.objects.filter(inventory_status=InventoryStatus.RESERVED).count(),
                "sold_products": Product.objects.filter(inventory_status=InventoryStatus.SOLD).count(),
                "returned_products": Product.objects.filter(inventory_status=InventoryStatus.RETURNED).count(),
                "inventory_value": Product.objects.filter(inventory_status=InventoryStatus.AVAILABLE).aggregate(total=Sum("selling_price"))["total"] or 0,
                "product_counts": list(product_counts),
                "leads_by_stage": list(leads_by_stage),
                "followups_due_today": Task.objects.filter(due_date__date=today).exclude(status="Completed").count(),
                "overdue_followups": Task.objects.filter(due_date__lt=timezone.now()).exclude(status="Completed").count(),
                "reservations_expiring_today": ProductReservation.objects.filter(status=ReservationStatus.ACTIVE, reserved_until__date=today).count(),
                "recent_sync_errors": list(ZohoSyncLog.objects.filter(status="failed").order_by("-created_at").values("id", "module", "error_message", "created_at")[:8]),
            }
        )


class InventorySummaryView(APIView):
    def get(self, request):
        by_category = Product.objects.values("category").annotate(count=Count("id"), value=Sum("selling_price")).order_by("category")
        missing_sku = Product.objects.filter(sku__isnull=True).count()
        missing_certification = Product.objects.filter(certification_type__in=["Unknown", "No"]).count()
        return Response({"by_category": list(by_category), "missing_sku": missing_sku, "missing_certification": missing_certification})
