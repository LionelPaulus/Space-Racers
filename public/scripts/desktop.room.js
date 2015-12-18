// When the server send us the room code
socket.on('room:created', function (id) {
    changePage('room-code');
    $('#code h1').html(id);
});

// When a new player join the room
socket.on('room:players', function (players) {
    $('#playersNumber').html(players +' joueurs');
});

// When the server refuse to start the game
socket.on('game:error', function (message) {
    alert(message);
});


// When the server accept the start of the game
socket.on('spaceship:started', function () {
    changePage('selection');
    sounds.starship_selection = new Howl({
        urls:["sounds/starship_selection.mp3"],
        volume: 0.5,
        buffer:true,
        loop:true
    }).play();
});


$('#askCode').on('click', function () {
    socket.emit('room:create');
});

$('#start-game').on('click', function () {
    socket.emit('spaceship:start');
});
