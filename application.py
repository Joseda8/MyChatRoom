import os
import dto

from flask import Flask, session, render_template, request, redirect, url_for, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

#pip3 install -r requirements.txt
#set FLASK_APP=application.py
#http://192.168.1.6:5000/
#flask run --host=0.0.0.0

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

rooms = dto.Rooms()

@app.route("/")
def index():
    return render_template("chat_room.html", rooms=rooms.get_rooms_names())


@socketio.on("create_room")
def create_room(data):
    room_name = data["room_name"]

    if(not rooms.exist_room(room_name)):
        new_Room = dto.Room(room_name)
        rooms.add_room(new_Room)
        emit("new_room", {"room_name": room_name}, broadcast=True)
    else:
        emit("message", {"message": "This name already exists"})


@socketio.on("new_message")
def new_message(data):
    room_name = data["room_name"]
    username = data["username"]
    txt_message = data["message"]
    datetime = data["datetime"]

    message = dto.Message(txt_message, username, datetime)
    rooms.search_room(room_name).add_message(message)
    
    emit("receive_new_message",
         {"room_name": room_name, "username": username,
          "message": txt_message, "datetime": datetime},
         broadcast=True)


@socketio.on("message_per_100")
def message_per_100(data):
    room_name = data["room_name"]
    username = data["username"]
    txt_message = data["message"]
    datetime = data["datetime"]

    i=1
    while(i!=101):        
        message = dto.Message(str(i), username, datetime)
        rooms.search_room(room_name).add_message(message)
        i+=1
    emit("new_100")


@app.route("/get_messages", methods=["POST"])
def get_messages():

    room_name = str(request.form.get("room_name"))

    messages = rooms.search_room(room_name).get_messages()
    data = []
    for i in range(0, 100):
        try:
            data.append({"text": messages[i][0],
                         "username": messages[i][1],
                         "timestamp": messages[i][2]})
        except:
            pass

    return jsonify(data)


@socketio.on("sound")
def sound(data):
    room_name = data["room_name"]
    sound_name = data["sound_name"]

    emit("play_sound",
         {"room_name": room_name, "sound_name": sound_name},
         broadcast=True)

