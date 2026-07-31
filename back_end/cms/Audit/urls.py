from django.urls import path
from . import views

urlpatterns = [

    path('tickets/', views.ticket_list),

    path('tickets/create/', views.create_ticket),

]