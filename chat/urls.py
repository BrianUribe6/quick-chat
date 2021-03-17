from django.urls import path
from . import views


app_name = 'quick-chat'
urlpatterns = [
    path('', view=views.index, name='index'),
]
