var currentSlide = 1;
var hammertime = new Hammer(document.querySelector('#mobile [data-page="spaceship"]'));
hammertime.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });


// Quand le spaceship a bien ete pick
socket.on('spaceship:success', function () {
	changePage('waiting');
	updateUsedSpaceship([]);
});

// Quand le vaisseau est deja used
socket.on('spaceship:error', function (message) {
	alert(message);
});

// Quand un utilisateur choisi un vaisseau
socket.on('spaceship:picked', function (spaceships) {
	spaceships = JSON.parse(spaceships);
	updateUsedSpaceship(spaceships);
});



////////////////
// EVENEMENTS //
////////////////
hammertime.on('swipeup', function () {
	if ((currentSlide + 1) > $('.spaceship').length) return;

	currentSlide++;
	updateSlider('left');
});

// User swipe Down
hammertime.on('swipedown', function () {
	if ((currentSlide - 1) <= 0) return;

	currentSlide--;
	updateSlider('right');
});


// User choose spaceship
$('.spaceship button').on('click', function () {
	socket.emit('spaceship:choose', currentSlide);
});



function updateSlider(dir) {
	if (dir == 'left') {
		$('.spaceship[data-spaceship="'+ (currentSlide - 1) +'"]').css('transform', 'translateY(-100%)');
	} else if (dir == 'right') {
		$('.spaceship[data-spaceship="'+ (currentSlide + 1) +'"]').css('transform', 'translateY(100%)');
	}

	$('.spaceship[data-spaceship="'+ currentSlide +'"]').css('transform', 'translateY(0)');
	$('#swipe-anim .active').removeClass('active');
	$('#swipe-anim [data-index="'+ currentSlide +'"]').addClass('active');
}

function updateUsedSpaceship(spaceships) {
	for (var i in spaceships) {
		var spaceship = spaceships[i];

		$('.spaceship[data-spaceship="'+ spaceship +'"]').addClass('unavailable');
		$('.spaceship[data-spaceship="'+ spaceship +'"] button').html('ALREADY USED');
	}
}

updateSlider('init');
