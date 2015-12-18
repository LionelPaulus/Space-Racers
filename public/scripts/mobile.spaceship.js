// When the spaceship is pick
socket.on('spaceship:success', function () {
	changePage('rules');
	updateUsedSpaceship([]);
});

// When the spaceship is already used
socket.on('spaceship:error', function (message) {
	displayError(message);
});

// When a user try to pick a spaceship
socket.on('spaceship:picked', function (spaceships) {
	spaceships = JSON.parse(spaceships);
	updateUsedSpaceship(spaceships);
});



////////////
// EVENTS //
////////////

// User choose spaceship
$('.spaceship[data-spaceship]').on('click', function () {
	var spaceship = $(this).attr('data-spaceship');
	socket.emit('spaceship:choose', spaceship);
});

function updateUsedSpaceship(spaceships) {
	$('.spaceship.unavailable').removeClass('unavailable');

	for (var i in spaceships) {
		var spaceship = spaceships[i];
		$('.spaceship[data-spaceship="'+ spaceship +'"]').addClass('unavailable');
	}
}
