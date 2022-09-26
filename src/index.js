const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, getUser, removeUser, getUsernamesInRoom } = require('./utils/users');
const { getRoom,
        getRooms, 
        registerUserToRoom, 
        deregisterUserFromRoom, 
        getAllUsersInRoom } = require('./utils/rooms');
const { ifError } = require('assert');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

// Runs for every client conection
io.on('connection', (socket) => {
    socket.emit('roomsList', getRooms());

    socket.on('join', ({username, roomName, password }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, roomName });
        if(error) return callback(error);

        const { roomError, room } = registerUserToRoom(user, roomName, password);
        if(roomError) return callback(roomError);


        socket.join(user.room);
        
        // Send welcome message and anounce to others
        socket.emit('welcome', generateMessage('Welcome to socket server!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: room.users
        })

        callback();
    })

    // The message client wrote
    socket.on('sendMessage', (message, callback) => {
        //Check message
        const filter = new Filter();
        if(filter.isProfane(message))
            return callback('Bad words are not allowed');

        const user = getUser(socket.id);

        //Send the message to the room
        const room = getRoom(user.room);
        if(room.lastSender === user.id){
            io.to(user.room).emit('addMessage', message);
        }
        else{
            room.lastSender = user.id;
            io.to(user.room).emit('message', generateMessage(user.username, message));
        }
        callback();
    })
    
    // Client's shared location
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    })


    socket.on('disconnecting', () => {
        const user = removeUser(socket.id);
        if(!user) return

        socket.leave(user.room);

        // user.room is the name of the room
        deregisterUserFromRoom(socket.id, user.room);

        io.to(user.room).emit('message', generateMessage('admin',`${user.username} has left`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsernamesInRoom(user.room)
        })
        
    });
})

server.listen(port, () => console.log(`server is up on port ${port}`));