from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Ticket
from .serializers import TicketSerializer

from accounts.models import User


# Employee raises ticket
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def raise_ticket(request):

    print("Request Data:", request.data)
    print("User:", request.user.username)
    print("Role:", request.user.role)

    if request.user.role != "EMPLOYEE":
        return Response(
            {"message": "Only employees can raise tickets."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = TicketSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(employee=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print("Serializer Errors:", serializer.errors)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Employee views own tickets
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tickets(request):

    if request.user.role != "EMPLOYEE":
            return Response(
                {"message": "Only employees can raise tickets."},
                status=status.HTTP_403_FORBIDDEN
            )
        

    tickets = Ticket.objects.filter(employee=request.user)

    serializer = TicketSerializer(tickets, many=True)

    return Response(serializer.data)


# Admin views all tickets
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_tickets(request):

    if request.user.role != "ADMIN":
        return Response(
            {"message": "Permission Denied"},
            status=status.HTTP_403_FORBIDDEN
        )

    tickets = Ticket.objects.all()

    serializer = TicketSerializer(tickets, many=True)

    return Response(serializer.data)


# Admin assigns support
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def assign_support(request, pk):

    if request.user.role != "ADMIN":
        return Response(
            {"message": "Permission Denied"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        ticket = Ticket.objects.get(id=pk)

        support = User.objects.get(
            id=request.data["support_id"],
            role="SUPPORT"
        )

    except Ticket.DoesNotExist:
        return Response(
            {"message": "Ticket Not Found"},
            status=404
        )

    except User.DoesNotExist:
        return Response(
            {"message": "Support User Not Found"},
            status=404
        )

    ticket.assigned_to = support
    ticket.status = "IN_PROGRESS"
    ticket.save()

    return Response({
        "message": "Support Assigned Successfully",
        "ticket_id": ticket.id,
        "assigned_to": support.username,
        "status": ticket.status
    })

# Support views assigned tickets
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_tickets(request):

    print("Logged in user:", request.user.username)
    print("Role:", request.user.role)

    tickets = Ticket.objects.filter(
        assigned_to=request.user
    )

    print("Tickets:", tickets)

    serializer = TicketSerializer(tickets, many=True)
    if request.user.role != "SUPPORT":
        return Response(
            {"message": "Permission Denied"},
            status=status.HTTP_403_FORBIDDEN
        )
    else:
        return Response(serializer.data)

# Support closes ticket
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def close_ticket(request, pk):

    if request.user.role != "SUPPORT":
        return Response(
            {"message": "Permission Denied"},
            status=status.HTTP_403_FORBIDDEN
        )

    ticket = Ticket.objects.get(id=pk)

    if ticket.assigned_to != request.user:
        return Response(
            {"message": "This ticket is not assigned to you."},
            status=status.HTTP_403_FORBIDDEN
        )

    ticket.status = "CLOSED"
    ticket.resolution = request.data.get("resolution", "")

    if "resolution_image" in request.FILES:
        ticket.resolution_image = request.FILES["resolution_image"]

    ticket.save()

    return Response({
        "message": "Ticket Closed Successfully"
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def support_users(request):

    if request.user.role != "ADMIN":
        return Response(
            {"message": "Permission Denied"},
            status=status.HTTP_403_FORBIDDEN
        )

    users = User.objects.filter(role="SUPPORT")

    data = []

    for user in users:
        data.append({
            "id": user.id,
            "username": user.username
        })

    return Response(data)