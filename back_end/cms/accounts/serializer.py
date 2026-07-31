from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "role",
            "password",
        ]

    def create(self, validated_data):

        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            role=validated_data["role"],
            phone=validated_data["phone"],
        )

        user.set_password(validated_data["password"])
        user.save()

        return user


# ---------------- JWT Login Serializer ----------------

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["username"] = user.username
        token["role"] = user.role

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data["username"] = self.user.username
        data["role"] = self.user.role

        return data