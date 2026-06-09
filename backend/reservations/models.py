from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone

from products.models import InventoryStatus


class ReservationStatus(models.TextChoices):
    ACTIVE = "Active", "Active"
    EXPIRED = "Expired", "Expired"
    CONVERTED = "Converted to Sale", "Converted to Sale"
    CANCELLED = "Cancelled", "Cancelled"


class ProductReservation(models.Model):
    product = models.ForeignKey("products.Product", on_delete=models.PROTECT, related_name="reservations")
    customer = models.ForeignKey("customers.Customer", on_delete=models.CASCADE, related_name="reservations")
    lead = models.ForeignKey("leads.Lead", null=True, blank=True, on_delete=models.SET_NULL, related_name="reservations")
    reserved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    reserved_at = models.DateTimeField(auto_now_add=True)
    reserved_until = models.DateTimeField()
    advance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=32, choices=ReservationStatus.choices, default=ReservationStatus.ACTIVE)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["status", "reserved_until"])]

    def clean(self):
        if self.status == ReservationStatus.ACTIVE and self.product.inventory_status != InventoryStatus.AVAILABLE:
            raise ValidationError("Only Available products can be reserved.")
        if self.reserved_until <= timezone.now():
            raise ValidationError("Reservation expiry must be in the future.")

    @classmethod
    def create_active(cls, *, product, customer, lead=None, reserved_by=None, reserved_until=None, advance_amount=0, notes=""):
        if reserved_until is None or reserved_until <= timezone.now():
            raise ValidationError("Reservation expiry must be in the future.")
        with transaction.atomic():
            locked_product = product.__class__.objects.select_for_update().get(pk=product.pk)
            if locked_product.inventory_status != InventoryStatus.AVAILABLE:
                raise ValidationError("Product is not available for reservation.")
            reservation = cls.objects.create(
                product=locked_product,
                customer=customer,
                lead=lead,
                reserved_by=reserved_by,
                reserved_until=reserved_until,
                advance_amount=advance_amount,
                notes=notes,
            )
            locked_product.inventory_status = InventoryStatus.RESERVED
            locked_product.reserved_customer = customer
            locked_product.reserved_until = reserved_until
            locked_product.save(update_fields=["inventory_status", "reserved_customer", "reserved_until", "updated_at"])
            return reservation

    def release(self, status):
        with transaction.atomic():
            reservation = ProductReservation.objects.select_for_update().select_related("product").get(pk=self.pk)
            reservation.status = status
            reservation.save(update_fields=["status", "updated_at"])
            product = reservation.product
            if product.inventory_status == InventoryStatus.RESERVED:
                product.inventory_status = InventoryStatus.AVAILABLE
                product.reserved_customer = None
                product.reserved_until = None
                product.save(update_fields=["inventory_status", "reserved_customer", "reserved_until", "updated_at"])
            return reservation
