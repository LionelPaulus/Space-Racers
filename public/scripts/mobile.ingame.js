var inGameInit = function () {
    var x = 0,
        y = 0,
        z = 0,
        invert = false,
        first_time = true;

    // Actually, it doesn't work (that's why we are using noSleep) but we are waiting the Chrome update
    document.keepScreenAwake = true;

    window.ondevicemotion = function(e) {
        x = event.accelerationIncludingGravity.x;
        y = event.accelerationIncludingGravity.y;
        z = event.accelerationIncludingGravity.z;

        // Adapt for iPhone & iPod
        if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
            z = -z;
        }

        // Verify how the player is holding the phone
        if((x < 0)&&(first_time)){
            invert = true;
        }
        first_time = false;
        
        // If phone is handed in the other side
        if(invert){
            x = -x;
            y = -y;
        }

        socket.emit('game:move', JSON.stringify({
            x: x,
            y: y,
            z: z
        }));

        // For tests only
        $('#mobile [data-page="game"] .coords').html(Math.floor(x) +':'+ Math.floor(y) +':'+ Math.floor(z));
    };

    $('#mobile [data-page="game"] p b').html('TAP SCREEN TO SHOOT MISSILES');
    Waves.attach('#mobile [data-page="game"]');
    Waves.init();


    $('#mobile [data-page="game"]').on('click', function () {
        socket.emit('game:fire');
    });
};


var inGameReset = function () {
    window.ondevicemotion = function () {};
    $('#mobile [data-page="game"]').off('click');
}


// Quand l'utilisateur meurt
socket.on('game:dead', function () {
    $('#mobile [data-page="game"] p b').html('YOU ARE DEAD, SORRY');
    inGameReset();
    window.navigator.vibrate(1000);
});
