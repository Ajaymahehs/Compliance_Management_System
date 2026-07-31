from django.urls import path

from .views import *

urlpatterns = [

    path(
        "tickets/",
        raise_ticket,
        name="raise-ticket"
    ),

    path(
        "my-tickets/",
        my_tickets,
        name="my-tickets"
    ),

    path(
        "admin/tickets/",
        all_tickets,
        name="all-tickets"
    ),

    path(
        "admin/assign/<int:pk>/",
        assign_support,
        name="assign-support"
    ),

    path(
    "admin/support-users/",
    support_users,
    name="support-users"
     ),

    path(
        "support/tickets/",
        support_tickets,
        name="support-tickets"
    ),

    path(
        "support/close/<int:pk>/",
        close_ticket,
        name="close-ticket"
    ),

]