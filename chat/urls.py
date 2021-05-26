from django.urls import path, re_path
from . import views


app_name = 'quick-chat'
urlpatterns = [
    re_path(r'',view=views.index),
    # re_path('^.*/$', view=views.index, name='index'),
]
