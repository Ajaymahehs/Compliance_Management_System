from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Ticket
from .serializers import TicketSerializer


# GET جميع tickets
@api_view(['GET'])
def ticket_list(request):
    tickets = Ticket.objects.all()

    serializer = TicketSerializer(tickets, many=True)

    return Response(serializer.data)


# POST create ticket
@api_view(['POST'])
def create_ticket(request):

    serializer = TicketSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,
                        status=status.HTTP_201_CREATED)

    return Response(serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST)