from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse

from rest_framework import viewsets
from .models import Room
from QuickChat.serializers import RoomSerializer


def index(request):
    if settings.DEBUG:
        return HttpResponse(
            "<h1>Development mode is active</h1>"
            "<p>Run <strong>npm run start</strong> in the front end directory "
            "and go to <a href='http://localhost:3000'>index page</a></p>"
            )
    return render(request, "index.html")


class RoomViewSet(viewsets.ModelViewSet):
    
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


