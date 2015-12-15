var currentSlide = 1;
var hammertime = new Hammer(document.getElementById('mobile'));
hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

hammertime.on('swipeleft', function () {
	if ((currentSlide + 1) > $('.spaceship').length) return;

	currentSlide++;
	updateSlider('left');
});

hammertime.on('swiperight', function () {
	if ((currentSlide - 1) <= 0) return;

	currentSlide--;
	updateSlider('right');
})

function updateSlider(dir) {
	if (dir == 'left') {
		$('.spaceship[data-spaceship="'+ (currentSlide - 1) +'"]').css('transform', 'translateX(-100%)');
	} else if (dir == 'right') {
		$('.spaceship[data-spaceship="'+ (currentSlide + 1) +'"]').css('transform', 'translateX(100%)');
	}

	$('.spaceship[data-spaceship="'+ currentSlide +'"]').css('transform', 'translateX(0)');
}

updateSlider('init');