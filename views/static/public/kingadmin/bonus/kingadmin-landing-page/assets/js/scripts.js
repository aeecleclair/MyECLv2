$(document).ready( function() {

	/*----------------------/
	/* NAVIGATION
	/*---------------------*/

	$(window).scroll(function() {
		if($(document).scrollTop() > 100) {
			$('.navbar-fixed-top').addClass('navbar-solid-color');
		}else {
			$('.navbar-fixed-top').removeClass('navbar-solid-color');
		}
	});

	// scrollspy
	$('body').scrollspy({ target: '#main-navbar', offset: 120});

	// onepage scroll links
	$('.nav-onepage, .onepage-links').localScroll({
		duration: 500,
		offset:  - $('.navbar-fixed-top').height()
	});

	// hide collapsible menu once menu item clicked 
	$('.nav-onepage li a').click( function() {
		var navbarCollapse = $(this).parents('.navbar-collapse.collapse');

		if(navbarCollapse.hasClass('in')) {
			navbarCollapse.collapse('hide');
		}
	});


	/*----------------------/
	/* TESTIMONIAL
	/*---------------------*/

	$('#testimonial-big-carousel').owlCarousel({
		singleItem: true,
		autoPlay: 3000,
		transitionStyle: 'fadeUp'
	});


});