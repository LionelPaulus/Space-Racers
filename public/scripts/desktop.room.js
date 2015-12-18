// Lorsque le serveur nous envoie le code de la room
socket.on('room:created', function (id) {
    changePage('room-code');
    $('#code h1').html(id);
});

// When a new player join the room
socket.on('room:players', function (players) {
    $('#playersNumber').html(players +' joueurs');
});

// Lorsque le serveur refuse le demarage du jeu
socket.on('game:error', function (message) {
    alert(message);
});


// Lorsque le serveur accepte le debut du jeu
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
