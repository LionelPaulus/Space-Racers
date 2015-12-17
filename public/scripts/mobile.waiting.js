// Quand la partie autorise a choisir un vaisseau
socket.on('spaceship:started', function () {
    $('#mobile .spaceship-waiting').addClass('leave');
    
    setTimeout(function() { 
        changePage('spaceship');
        updateUsedSpaceship(usedSpaceships);
        $('#mobile .spaceship-waiting').removeClass('leave'); 
    }, 700);
});


// Quand la partie commence
socket.on('game:started', function () {    
    $('#mobile .spaceship-waiting').addClass('leave');
    
    setTimeout(function() { 
        changePage('game');
        $('#mobile .spaceship-waiting').removeClass('leave'); 
        inGameInit();
    }, 700);
});
