$('.replay-button').on('click', function() {
	var answer = parseInt($(this).attr('data-answer'));

	socket.emit('game:replay', answer);
});