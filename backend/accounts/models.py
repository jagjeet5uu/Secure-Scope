from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    ADMIN = "admin", "Admin"
    SALES_MANAGER = "sales_manager", "Sales Manager"
    SALESPERSON = "salesperson", "Salesperson"
    INVENTORY_MANAGER = "inventory_manager", "Inventory Manager"
    ACCOUNTS = "accounts", "Accounts"
    SERVICE_STAFF = "service_staff", "Service Staff"


class User(AbstractUser):
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.SALESPERSON)
    mobile = models.CharField(max_length=32, blank=True)

    @property
    def is_admin_role(self):
        return self.role == Role.ADMIN or self.is_superuser
