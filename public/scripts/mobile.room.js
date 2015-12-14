socket.on('room:success', function (id) {
	$('#code-submit').hide();
	alert('Room joined');
	$('#end').html('You are in the room '+ id);
});

socket.on('room:error', function (message) {
	alert(message);
});


$('#code-submit').on('submit', function (e) {
	e.preventDefault();
	var code = $('#code').val();

	socket.emit('room:join', code);
});