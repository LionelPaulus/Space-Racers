// Quand la partie commence
socket.on('game:started', function (spaceships) {
    $('#mobile .spaceship-waiting').addClass('leave');
    setTimeout(function() { changePage('game'); $('#mobile .spaceship-waiting').removeClass('leave'); }, 600);
});
