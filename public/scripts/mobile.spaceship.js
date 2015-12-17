// Quand le spaceship a bien ete pick
socket.on('spaceship:success', function () {
	changePage('rules');
	updateUsedSpaceship([]);
});

// Quand le vaisseau est deja used
socket.on('spaceship:error', function (message) {
	displayError(message);
});

// Quand un utilisateur choisi un vaisseau
socket.on('spaceship:picked', function (spaceships) {
	spaceships = JSON.parse(spaceships);
	updateUsedSpaceship(spaceships);
});



////////////////
// EVENEMENTS //
////////////////

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
