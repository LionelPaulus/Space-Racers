// Lorsque le serveur nous envoie le code de la room
socket.on('room:created', function (id) {
    changePage('room-code');
    $('#code h1').html(id);
});

// Lorsque le serveur refuse le demarage du jeu
socket.on('game:error', function (message) {
    alert(message);
});


// Lorsque le serveur accepte le debut du jeu
socket.on('spaceship:started', function () {
    changePage('selection');
});


$('#askCode').on('click', function () {
    socket.emit('room:create');
});

$('#start-game').on('click', function () {
    socket.emit('spaceship:start');
});
