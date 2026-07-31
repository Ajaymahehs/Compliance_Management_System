from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):

    employee = serializers.CharField(
        source="employee.username",
        read_only=True
    )

    assigned_to = serializers.CharField(
        source="assigned_to.username",
        read_only=True
    )

    class Meta:
        model = Ticket
        fields = "__all__"

        read_only_fields = (
            "employee",
            "assigned_to",
            "status",
            "resolution",
            "resolution_image",
            "created_at",
            "updated_at",
        )