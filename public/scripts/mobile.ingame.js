var noSleep = new NoSleep();

var inGameInit = function () {
    noSleep.enable();
    // Chrome solution
    document.keepScreenAwake = true;

    window.ondevicemotion = function(e) {
        var x = event.accelerationIncludingGravity.x,
            y = event.accelerationIncludingGravity.y,
            z = event.accelerationIncludingGravity.z;

        if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
            z = -z;
        }

        socket.emit('game:move', JSON.stringify({
            x: x,
            y: y,
            z: z
        }));

        // For tests only
        $('#mobile [data-page="game"] .coords').html(Math.floor(x) +':'+ Math.floor(y) +':'+ Math.floor(z));
    };


    $('#mobile [data-page="game"]').on('click', function () {
        socket.emit('game:fire');
    });
};


var inGameReset = function () {
    noSleep.disable();

    window.ondevicemotion = function () {};
    $('#mobile [data-page="game"]').off('click');
}
