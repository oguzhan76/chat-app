const users = [];

const addUser = ({ id, username, roomName }) => {
    username = username.trim().toLowerCase();
    roomName = roomName.trim().toLowerCase();

    //Validate
    if(!username || !roomName) 
        return { error: 'Username and room are required' };

    //Check for existing user
    const userExists = users.find((user) => {
        return user.room === roomName && user.username === username
    });

    if(userExists)
        return { error: "Username is in use" };

    const user = { id, username, room: roomName };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1)
        return users.splice(index, 1)[0];
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsernamesInRoom = (room) => {
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsernamesInRoom
}