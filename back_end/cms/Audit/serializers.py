from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):

    employee = serializers.CharField(
        source="employee.username",
        read_only=True
    )

    assigned_to = serializers.SerializerMethodField()
    resolution_image = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "employee",
            "assigned_to",
            "title",
            "description",
            "priority",
            "status",
            "resolution",
            "resolution_image",
            "created_at",
            "updated_at",
        ]

    def get_assigned_to(self, obj):

        if obj.assigned_to:
            return {
                "id": obj.assigned_to.id,
                "username": obj.assigned_to.username
            }

        return None

    def get_resolution_image(self, obj):

        request = self.context.get("request")

        if obj.resolution_image:

            if request:
                return request.build_absolute_uri(obj.resolution_image.url)

            return obj.resolution_image.url

        return None