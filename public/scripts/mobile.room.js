// Quand on a rejoint la room
socket.on('room:success', function (id) {
    $('#code-submit').hide();
    alert('Room joined');
    $('#end').html('You are in the room '+ id);
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


// Quand on soumet le code
$('#code-submit').on('submit', function (e) {
    e.preventDefault();
    var code = $('#code').val();

    socket.emit('room:join', code);
});
