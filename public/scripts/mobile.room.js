// Quand on a rejoint la room
socket.on('room:success', function (id) {
    changePage('spaceship');
    alert('Room joined');
});

// Quand on ne peut pas rejoindre la room
socket.on('room:error', function (message) {
    alert(message);
});


// Quand l'hote se deconnecte
socket.on('room:close', function () {
	alert('L\'hote de la partie c\'est deconnecte');
	$('#end').html('');
	$('#code').val('');
	$('#code-submit').show();
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

