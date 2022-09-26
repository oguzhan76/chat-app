const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationURLTemplate = document.querySelector('#locationURL-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
const messageAddTemplate = document.querySelector('#message-add-template').innerHTML;

//Options
// location.search return query paramters on the url. second arg is options object
const { username, room, password } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // last message element
    const $newMessage = $messages.lastElementChild;

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // how far are we scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {   
        // autoscroll
        $messages.scrollTop = $messages.scrollHeight;
    }
}

// On Welcome Message
socket.on('welcome', (message) => {
    console.log(message.text);
})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, { 
        message: message.text,
        username: message.username,
        createdAt: moment(message.createdAt).format('kk:mm') 
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoScroll();
})

socket.on('addMessage', (message) => {
    const html = Mustache.render(messageAddTemplate, { message });
    $messages.insertAdjacentHTML("beforeend", html);

    autoScroll();
});

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationURLTemplate, { 
        url: message.url,
        username: message.username,
        createdAt: moment(message.createdAt).format('kk:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoScroll();
})

// When server updates room data
socket.on('roomData', (room) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room.room,
        users: room.users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

// Send message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message; // input field (name='message')

    socket.emit('sendMessage', message.value, (error) => {
        $messageFormButton.removeAttribute('disabled');
        message.focus();
        
        if(error)
            return console.log(error);
    });
    message.value = '';
});
    
// Send location
$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation)
        return alert('Your browser does not support geolocation');

    $locationButton.disabled = true;    

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, (error) => {
            $locationButton.disabled = false;
        });
    });
});

socket.emit('join',{ username, roomName: room, password }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});