if (!localStorage.getItem('username')){
    localStorage.setItem('username', '');
}
if (!localStorage.getItem('roomname')){
    localStorage.setItem('roomname', '');
}

function load(room_name) {

    const request = new XMLHttpRequest();
    request.open('POST', '/get_messages');

    //Cuando se tenga la respuesta
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        data.forEach(add_msg);
    };

    const data = new FormData();
    data.append('room_name', room_name);

    request.send(data);
};

function add_msg(contents) {
    const msg_div = document.createElement('div');
    msg_div.className = "message"

    const username = document.createElement('label');
    username.style.fontWeight = "bold";
    username.innerHTML = contents.username;
    const msg = document.createElement('label');
    msg.innerHTML = contents.text;
    const datetime = document.createElement('span');
    datetime.className = "help-block";
    datetime.innerHTML = contents.timestamp;

    msg_div.append(username);
    msg_div.append(document.createElement('br'));
    msg_div.append(msg);
    msg_div.append(document.createElement('br'));
    msg_div.append(datetime);

    document.querySelector('#messages').append(msg_div);
};

//Borrar de la pantalla los chats existentes
function clear_chat_window(){
    document.querySelectorAll('.message').forEach(div => {
        div.remove();
    });
}

document.addEventListener('DOMContentLoaded', function() {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    console.log(location.protocol + '//' + document.domain + ':' + location.port);

    load(localStorage.getItem('roomname'));

    socket.on('connect', () => {

        //Seleccionar una sala de chat
        document.querySelector('#room_select').onchange = function() {
            const selection = this.value;
            localStorage.setItem('roomname', selection);
            document.querySelector('#roomname_lbl').innerHTML = localStorage.getItem('roomname');

            clear_chat_window();
            load(localStorage.getItem('roomname'));
        };
    });

    //Crear nuevo cuarto
    document.querySelector('#create_room_btn').onclick = () => {
        const room_name= document.querySelector('#room_name_create').value;
        socket.emit('create_room', {'room_name': room_name});

        localStorage.setItem('roomname', room_name);
        document.querySelector('#roomname_lbl').innerHTML = localStorage.getItem('roomname');

        clear_chat_window();

        return false;
    }

    //Enviar un mensaje
    document.querySelector('#send_messages_btn').onclick = () => {
        const msg = document.querySelector('#message').value;
        var today = new Date();
        var time = today.getDate()+' - '+(today.getMonth()+1)+' - '+today.getFullYear()
        +' ('+today.getHours() + " : " + today.getMinutes() + " : " + today.getSeconds() + ")";

        if(msg=="100"){
            socket.emit('message_per_100', {'room_name': localStorage.getItem('roomname'), 'message':msg,
            'username': localStorage.getItem('username'), 'datetime': time});
        }else{
            socket.emit('new_message', {'room_name': localStorage.getItem('roomname'), 'message':msg,
            'username': localStorage.getItem('username'), 'datetime': time});
        }

        document.querySelector('#message').value = "";
        document.querySelector('#send_messages_btn').disabled = true;
        return false;
    }    

    socket.on('new_100', () => {
        load(localStorage.getItem('roomname'));
    });

    //Hay un nuevo cuarto
    socket.on('new_room', data => {
        const option = document.createElement('option');
        option.value = data.room_name;
        option.innerHTML = data.room_name;
        document.querySelector('#room_select').appendChild(option);
        document.querySelector('#lbl_choose_room').className = "flicker";
    });

    
    //Nuevo mensaje en canal activo
    socket.on('receive_new_message', data => {
        if(data.room_name==localStorage.getItem('roomname')){
            const msg_div = document.createElement('div');
            msg_div.className = "message"

            const username = document.createElement('label');
            username.style.fontWeight = "bold";
            username.innerHTML = data.username;
            const msg = document.createElement('label');
            msg.innerHTML = data.message;
            const datetime = document.createElement('span');
            datetime.className = "help-block";
            datetime.innerHTML = data.datetime;

            msg_div.append(username);
            msg_div.append(document.createElement('br'));
            msg_div.append(msg);
            msg_div.append(document.createElement('br'));
            msg_div.append(datetime);

            document.querySelector('#messages').append(msg_div);
        }
    });

    //Alertas provenientes del servidor
    socket.on('message', data => {
        alert(data.message);
    });

    //Desactivar animación de nuevas salas
    document.querySelector('#room_select').onclick = function() {
        document.querySelector('#lbl_choose_room').className = "";
    };

    //Reproducir sonidos
    socket.on('play_sound', data => {
        if(data.room_name==localStorage.getItem('roomname')){
            document.getElementById("audio").src = "/static/sounds/" + data.sound_name + ".wav";
            var audio = document.getElementById("audio");
            audio.play();
        }
    });

    //Captar botón de sonido presionado
    document.querySelectorAll('.sound_btn').forEach(function(button) {
        button.onclick = function() {
            socket.emit('sound', {'sound_name': button.dataset.sound, "room_name": localStorage.getItem('roomname')});
        };
    });

    //Asignar gráficamente el nombre de usuario
    document.querySelector('#set_name_btn').onclick = () => {
        const username= document.querySelector('#username').value;
        localStorage.setItem('username', username);
        document.querySelector('#username_lbl').innerHTML = "Welcome to My Chat Room " + username + "!";

        return false;
    }

    const username = localStorage.getItem('username');
    const roomname = localStorage.getItem('roomname');
    document.querySelector('#username_lbl').innerHTML = "Welcome to My Chat Room " + username + "!";
    document.querySelector('#roomname_lbl').innerHTML = roomname;

    document.querySelector('footer').style.marginTop = document.body.offsetHeight-500+"px";
            
    /*
        Validación de botones
    */
   
    //Inicialmente están desactivados
    document.querySelector('#set_name_btn').disabled = true;
    document.querySelector('#create_room_btn').disabled = true;
    document.querySelector('#send_messages_btn').disabled = true;

    document.querySelector('#username').onkeyup = () => {
        if (document.querySelector('#username').value.length > 0 && 
            document.querySelector('#username').value.length < 15){

            document.querySelector('#set_name_btn').disabled = false;
        }else{
            document.querySelector('#set_name_btn').disabled = true;
        }
    };

    document.querySelector('#room_name_create').onkeyup = () => {
        if (document.querySelector('#room_name_create').value.length > 0 && 
            document.querySelector('#room_name_create').value.length < 15){

            document.querySelector('#create_room_btn').disabled = false;
        }else{
            document.querySelector('#create_room_btn').disabled = true;
        }
    };

    document.querySelector('#message').onkeyup = () => {
        if (document.querySelector('#message').value.length > 0 && 
            document.querySelector('#message').value.length < 500){

            document.querySelector('#send_messages_btn').disabled = false;
        }else{
            document.querySelector('#send_messages_btn').disabled = true;
        }
    };
});
