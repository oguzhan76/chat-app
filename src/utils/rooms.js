// array of objects {roomname, users}
const rooms = [];

const getRooms = () => {
    return rooms;
}

const registerUserToRoom = (userId, room) => {
    // Update room array
    const selectedRoom = rooms.find(curRoom => curRoom.roomName === room);
    if(!selectedRoom)
        rooms.push({ roomName: room, users: [userId]});
    else
        selectedRoom.users.push(userId);
}

const deregisterUserFromRoom = (userId, room) => {
    console.log(rooms);
    console.log('deleting ', userId);
    const index = rooms.findIndex(curRoom => curRoom.roomName === room);
    if(index == -1) return;

    const userIndex = rooms[index].users.findIndex(user => user === userId);

    if(userIndex !== -1 && rooms[index].users.length == 1)
        rooms.splice(index, 1); // delete the room
    else
        rooms[index].users.splice(userIndex, 1); // delete the user from the room
    console.log(rooms);
}

module.exports = {
    getRooms,
    registerUserToRoom,
    deregisterUserFromRoom
}