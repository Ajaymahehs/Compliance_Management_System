from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:

        model = User

        fields = [
            'username',
            'email',
            'phone',
            'role',
            'password'
        ]

    def create(self, validated_data):

        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data['role'],
            phone=validated_data['phone']
        )

        user.set_password(validated_data['password'])

        user.save()

        return user