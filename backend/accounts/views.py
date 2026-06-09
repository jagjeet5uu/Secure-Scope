from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .permissions import role_permission
from .serializers import UserSerializer


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.order_by("username")
    serializer_class = UserSerializer
    permission_classes = [role_permission("admin")]
    search_fields = ["username", "email", "first_name", "last_name", "mobile"]
    filterset_fields = ["role", "is_active"]
