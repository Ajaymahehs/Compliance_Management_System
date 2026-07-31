from django.urls import path
from .views import register, logout, LoginView

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", logout, name="logout"),
]