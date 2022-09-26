const socket = io();

//elements
const $roomList = document.querySelector('#roomList');
const $joinForm = document.querySelector('#join-form');

//templates
const roomButtonTemplate = document.querySelector('#room-button-template').innerHTML;

let roomButtons;
let selectedRoom;

$joinForm.addEventListener('submit', () => {
    if(selectedRoom)
        document.getElementById('room-input').value = selectedRoom;
})

socket.on('roomsList', (rooms) => {
    const html = Mustache.render(roomButtonTemplate, { rooms });
    document.querySelector('#roomList').innerHTML = html;

    roomButtons = $roomList.children;
    for(let i=0; i< roomButtons.length; i++) {  
        roomButtons[i].addEventListener('click', () => {
            resetRoomButtons();
            selectedRoom = roomButtons[i].textContent;
            roomButtons[i].classList.add("selected");
    })
}
});

const resetRoomButtons = () => {
    for(let i=0; i< roomButtons.length; i++) {
        roomButtons[i].classList.remove("selected");
    }
}

// prioritize createroom over selection
