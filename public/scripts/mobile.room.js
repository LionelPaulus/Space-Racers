// Quand on a rejoint la room
//   spaceship: [] <- Spaceship already used
socket.on('room:success', function (spaceship) {
    usedSpaceships = JSON.parse(spaceship);
    
    changePage('waiting');
});

// Quand on ne peut pas rejoindre la room
socket.on('room:error', function (message) {
    displayError(message);
});


// Quand l'hote se deconnecte
socket.on('room:close', function () {
    inGameReset();
	displayError('L\'hote de la partie c\'est deconnecte');
    $('#code').html('');
	changePage('code');
});



////////////////
// EVENEMENTS //
////////////////

// Quand on soumet le code
$('#join').on('click', function (e) {
    e.preventDefault();
    var code = $('#code').html();

    socket.emit('room:join', code);
});

// entering the code on smartphone
$('button[data-value]').on('click', function() {
    if ($('#mobile #code').html().length == 4) return;
    
    $("#mobile #code").first().append($(this).data("value"));
});

//deleting a number
$('#del').on('click', function() {
    $("#mobile #code").text(function(i, text) {
        return text.slice(0, -1);
    });
});

