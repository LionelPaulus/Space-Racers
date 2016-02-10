// When the server send us the room code
socket.on('room:created', function (id) {
    changePage('room-code');
    $('#code h1').html(id);
});

// When a new player join the room
socket.on('room:players', function (players) {
    if(players > 1){
        $('#playersNumber').html(players +' players');

        // Force game start when 4 players in the room
        if(players === 4){
            socket.emit('spaceship:start');
        }
    }else{
        $('#playersNumber').html(players +' player');
    }
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

$('#start-game').on('click', function () {
    socket.emit('spaceship:start');
});

$('section[data-page="end"]').on('click', function () {
    // Exit fullscreen
    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
});

$('#askCode').on('click', function () {
    socket.emit('room:create');

    // Go into fullscreen
    var elem = document.querySelector('#content');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
});
