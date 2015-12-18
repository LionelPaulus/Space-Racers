// When the game agree the spacechip selection
socket.on('spaceship:started', function () {
    $('#mobile .spaceship-waiting').addClass('leave');

    setTimeout(function() {
        changePage('spaceship');
        updateUsedSpaceship(usedSpaceships);
        $('#mobile .spaceship-waiting').removeClass('leave');
    }, 700);
});


// When the game starts
socket.on('game:started', function () {
    $('#mobile .spaceship-waiting').addClass('leave');

    setTimeout(function() {
        changePage('game');
        $('#mobile .spaceship-waiting').removeClass('leave');
        inGameInit();
    }, 700);
});
