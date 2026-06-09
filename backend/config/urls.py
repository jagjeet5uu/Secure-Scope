from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.views import MeView, UserViewSet
from after_sales.views import AfterSalesRequestViewSet
from audit_logs.views import AuditLogViewSet
from customers.views import CustomerViewSet
from imports.views import ImportLogViewSet
from leads.views import LeadActivityViewSet, LeadViewSet
from products.views import ProductCertificateViewSet, ProductImageViewSet, ProductViewSet
from quotations.views import QuotationViewSet
from reports.views import DashboardReportView, InventorySummaryView
from reservations.views import ProductReservationViewSet
from tasks_app.views import TaskViewSet
from zoho_integration.views import SyncLogViewSet, ZohoActionViewSet, ZohoWebhookView

router = DefaultRouter()
router.register("users", UserViewSet)
router.register("customers", CustomerViewSet)
router.register("leads", LeadViewSet)
router.register("lead-activities", LeadActivityViewSet)
router.register("tasks", TaskViewSet)
router.register("products", ProductViewSet)
router.register("product-images", ProductImageViewSet)
router.register("product-certificates", ProductCertificateViewSet)
router.register("reservations", ProductReservationViewSet)
router.register("quotations", QuotationViewSet)
router.register("after-sales", AfterSalesRequestViewSet)
router.register("zoho/sync-logs", SyncLogViewSet)
router.register("zoho/actions", ZohoActionViewSet, basename="zoho-actions")
router.register("audit-logs", AuditLogViewSet)
router.register("imports", ImportLogViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/me", MeView.as_view(), name="me"),
    path("api/reports/dashboard", DashboardReportView.as_view(), name="dashboard-report"),
    path("api/reports/inventory-summary", InventorySummaryView.as_view(), name="inventory-summary"),
    path("api/zoho/create-invoice", ZohoActionViewSet.as_view({"post": "create_invoice"}), name="zoho-create-invoice"),
    path("api/zoho/create-estimate", ZohoActionViewSet.as_view({"post": "create_estimate"}), name="zoho-create-estimate"),
    path("api/webhooks/zoho/<str:event_type>", ZohoWebhookView.as_view(), name="zoho-webhook"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/", include(router.urls)),
]
