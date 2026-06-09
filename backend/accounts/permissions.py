from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    allowed_roles = set()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or getattr(request.user, "role", None) == "admin":
            return True
        if not self.allowed_roles:
            return True
        return request.user.role in self.allowed_roles


def role_permission(*roles):
    class CustomRolePermission(RolePermission):
        allowed_roles = set(roles)

    return CustomRolePermission
