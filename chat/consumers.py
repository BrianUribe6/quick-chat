import json
from channels.generic.websocket import AsyncWebsocketConsumer


TYPE_MESSAGE = "chat_message"

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.group_name = f"group_{self.room_name}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()
    
    
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.group_name, self.channel_name
        )


    async def receive(self, text_data):
        response = json.loads(text_data)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat_message",
                "username": response['username'],
                "avatar": response['avatar'],
                "text": response['text'],
            }
        )
    

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))