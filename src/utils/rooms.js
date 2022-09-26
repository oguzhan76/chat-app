// array of objects {roomName, users = {id, username, room}, lastSender}
const rooms = [];

const getRooms = () => {
    return rooms;
}

// const getLastSender()

const getAllUsersInRoom = (roomName) => {
    return rooms.find((r) => r.roomName === roomName).users;
}

const getRoom = (roomName) => {
    return rooms.find(room => room.roomName === roomName);
}

const registerUserToRoom = (user, room, password) => {
    room = room.trim().toLowerCase();
    // Update room array
    const selectedRoom = rooms.find(curRoom => curRoom.roomName === room);
    if(!selectedRoom){
        const newRoom = { roomName: room, password, users: [user], lastSender: null};
        rooms.push(newRoom);        
        return { room: newRoom };
    }
    else{
        if(selectedRoom.password !== password)
            return { roomError: "Password is wrong!" };
        selectedRoom.users.push(user);
        return { room: selectedRoom };
    }
}

const deregisterUserFromRoom = (userId, roomName) => {
    const index = rooms.findIndex(curRoom => curRoom.roomName === roomName);
    if(index === -1) return;

    const userIndex = rooms[index].users.findIndex(user => user.id === userId);
    if(userIndex === -1) return;
    
    if(rooms[index].users.length == 1)
        rooms.splice(index, 1); // delete the room
    else
        rooms[index].users.splice(userIndex, 1); // delete the user from the room
}

module.exports = {
    getRoom,
    getRooms,
    getAllUsersInRoom,
    registerUserToRoom,
    deregisterUserFromRoom
}