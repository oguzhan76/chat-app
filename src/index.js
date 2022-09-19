const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));


// Runs for every client conection
io.on('connection', (socket) => {
    console.log('New webSocket connection');
    
    socket.on('join', ({username, room}, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if(error)
            return callback(error);

        socket.join(user.room);

        // Send welcome message and anounce to others
        socket.emit('welcome', generateMessage('Welcome to socket server!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
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
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    })
    
    // Client's shared location
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', generateMessage('admin',`${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });
})

server.listen(port, () => console.log(`server is up on port ${port}`));