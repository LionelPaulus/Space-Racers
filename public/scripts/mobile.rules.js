// Quand la partie commence
socket.on('game:started', function () {    
    changePage('game');
    inGameInit();
});
