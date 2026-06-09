from celery import shared_task
from django.utils import timezone

from reservations.models import ProductReservation, ReservationStatus
from products.models import InventoryStatus

from .models import WebhookLog, ZohoSyncLog


@shared_task
def expire_reservations():
    now = timezone.now()
    expired = 0
    for reservation in ProductReservation.objects.select_related("product").filter(status=ReservationStatus.ACTIVE, reserved_until__lte=now):
        reservation.status = ReservationStatus.EXPIRED
        reservation.save(update_fields=["status", "updated_at"])
        product = reservation.product
        if product.inventory_status == InventoryStatus.RESERVED:
            product.inventory_status = InventoryStatus.AVAILABLE
            product.reserved_customer = None
            product.reserved_until = None
            product.save(update_fields=["inventory_status", "reserved_customer", "reserved_until", "updated_at"])
        expired += 1
    return {"expired": expired}


@shared_task
def process_zoho_webhook(webhook_log_id):
    webhook = WebhookLog.objects.get(pk=webhook_log_id)
    webhook.status = "processed"
    webhook.processed_at = timezone.now()
    webhook.save(update_fields=["status", "processed_at"])
    return {"webhook_log_id": webhook_log_id}


@shared_task
def retry_failed_sync(sync_log_id):
    log = ZohoSyncLog.objects.get(pk=sync_log_id)
    log.status = "retrying"
    log.save(update_fields=["status"])
    return {"sync_log_id": sync_log_id, "status": "retrying"}
