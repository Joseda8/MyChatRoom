
class Rooms:
    rooms = []

    def add_room(self, room):
        self.rooms.append(room)

    def search_room(self, room_name):
        for room in self.rooms:
            if(room.name==room_name):
                return room
        return None

    def exist_room(self, room_name):
        for room in self.rooms:
            if(room.name==room_name):
                return True
        return False

    def get_rooms_names(self):
        rooms = []
        for room in self.rooms:
            rooms.append(room.name)
        return rooms


class Room:
    
    name = ""
    chat = []
    
    def __init__(self, name):
        self.name = name
        self.chat = []

    def add_message(self, message):
        if(len(self.chat)==100):
            self.chat.pop(0)
        self.chat.append(message)

    def get_messages(self):
        messages = []
        for msg in self.chat:
            messages.append(msg.get_message())
        return messages
        

class Message:
    
    text = ""
    user = ""
    timestamp = ""
    
    def __init__(self, text, user, timestamp):
        self.text = text
        self.user = user
        self.timestamp = timestamp

    def get_message(self):
        message = []
        message.append(self.text)
        message.append(self.user)
        message.append(self.timestamp)
        return message

        
