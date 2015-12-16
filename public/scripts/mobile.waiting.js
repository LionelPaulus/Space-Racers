// Quand la partie commence
socket.on('game:start', function (spaceships) {
    $('#mobile .spaceship-waiting').addClass('leave');
    setTimeout(function() { changePage('game'); }, 600);
});
