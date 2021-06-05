import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.http import Http404

from .models import Room


ERROR_CONNECTION_REJECTED = 4001
ERROR_NAME_UNAVAILABLE = 4002

# TYPE_MESSAGE = "chat_message"
TYPE_JOIN = 'chat.join'
TYPE_GET_USERS = 'chat.get.users'
TYPE_CHAT_LEAVE = 'chat.leave'


class ChatConsumer(AsyncWebsocketConsumer):

    online_users = {} # maps group name to dict. of users in the group
    user_channel = {} # maps channel name to user name
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        
        await self.accept()
        if not await self.isvalid_room():
            await self.close(ERROR_CONNECTION_REJECTED)
            return
        
        self.group_name = f"group_{self.room_name}"
        self.online_users.setdefault(self.group_name, {})
        await self.channel_layer.group_add(self.group_name, self.channel_name)


    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.group_name, self.channel_name
        )

        users = self.online_users[self.group_name]
        try:
            # remove all info related to this user
            username = self.user_channel[self.channel_name]
            del users[username]
            del self.user_channel[self.channel_name]
        except KeyError:
            # user was not in the room
            pass
        else:
            # inform all users in the room this user has left
            await self.channel_layer.group_send(self.group_name, {
                'type': TYPE_CHAT_LEAVE,
                'username': username,
            })


    async def receive(self, text_data):
        response = json.loads(text_data)
        users = self.online_users[self.group_name]
        if response['type'] == TYPE_GET_USERS:
            # only sent it the user who requested the full list
            await self.channel_layer.send(self.channel_name, response)
            return
            
        if response['type'] == TYPE_JOIN and response['username'] in users:
            await self.close(ERROR_NAME_UNAVAILABLE)
            return

        await self.channel_layer.group_send(self.group_name, response)
    
    
    async def chat_join(self, event):
        if self.channel_name not in self.user_channel:
            # the channel name corresponds to a new user
            users = self.online_users[self.group_name]
            username = event['username']
            self.user_channel[self.channel_name] = username
            users[username] = {
                'avatar': event['avatar'],
                # ... any additional user properties
            }
        await self.send_json(event)


    async def chat_message(self, event):
        await self.send_json(event)


    async def chat_get_users(self, event):
        users = self.online_users[self.group_name]
        event['user_list'] = [
            {'username': username, **attributes} 
            for username, attributes in users.items()
        ]
        await self.send_json(event)


    async def chat_leave(self, event):
        await self.send_json(event)


    async def send_json(self, event):
        await self.send(text_data=json.dumps(event))

    
    @database_sync_to_async
    def isvalid_room(self):
        try:
            Room.objects.get(name__iexact=self.room_name)
        except (Room.MultipleObjectsReturned, Room.DoesNotExist):
            return False

        return True
