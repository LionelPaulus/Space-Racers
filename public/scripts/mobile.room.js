// When we join the room
// spaceship: [] <- Spaceship already used
socket.on('room:success', function (spaceship) {
    usedSpaceships = JSON.parse(spaceship);

    changePage('waiting');
});

// When we can't join the room
socket.on('room:error', function (message) {
    displayError(message);
});


// Whe the host goes offline
socket.on('room:close', function () {
    inGameReset();
	displayError('The host of the game left');
    $('#code').html('');
	changePage('code');
});



////////////
// EVENTS //
////////////

// When we submit the code
$('#join').on('click', function (e) {
    e.preventDefault();
    var code = $('#code').html();

    socket.emit('room:join', code);

    // Enable noSleep
    var noSleep = new NoSleep();
    noSleep.enable();
});

// Entering the code on smartphone
$('button[data-value]').on('click', function() {
    if ($('#mobile #code').html().length == 4) return;

    $("#mobile #code").first().append($(this).data("value"));
});

// Deleting a number
$('#del').on('click', function() {
    $("#mobile #code").text(function(i, text) {
        return text.slice(0, -1);
    });
});
