'use strict';


var DEBUG = true ;
if(!DEBUG){
    if(!window.console) window.console = {};
    var methods = ["log", "debug", "warn", "info"];
    for(var i=0;i<methods.length;i++){
    	console[methods[i]] = function(){};
    }
}

// Declare app level module which depends on views, and components
var GlobocanApp = angular.module('GlobocanApp', [
	  'ngRoute' , // routing
	  'GlobocanControllers'
	])

	.config( function( $locationProvider , $routeProvider) {
  		
  		// use the HTML5 History API
		$locationProvider.html5Mode(true);
	
		$routeProvider

			// home page -----------
			.when( '/home' , {
				templateUrl	: 'templates/home.html', 
				reloadOnSearchVar : true
			})
			.when( '/data-sources-methods' , {
				templateUrl	: 'templates/data-sources-methods.html', 
				reloadOnSearchVar : true
			})
			.when( '/explore' , {
				templateUrl	: 'templates/explore.html', 
				reloadOnSearchVar : true
			})
			.when( '/help.html' , {
				templateUrl	: 'templates/help.html.html', 
				reloadOnSearchVar : true
			})
			

			// default template 
			.otherwise({ redirectTo : '/home' });		
	}
);


function angularGetScope(id_div) {
    return angular.element( document.getElementById( id_div ) ).scope() ; 
}

// Window resize event
$(window).resize( function(){
	// $('#main-content,video,.content-full,.content,.full-content').height( $(window).height() - 20 ) ;
	if ( $(window).width() < 1280 )
        $('#btnMobileNav').css('display','block') ;
    else
    	$('#btnMobileNav').css('display','none') ;
}); 


// On ready event
// @todo : extract to new file.js
$(document).ready(function(){

	$('nav.heading ul > li > a').click(function(){
		$('nav.heading ul li a').removeClass('active');
		$(this).addClass('active');
	});

	$('nav.heading ul.sub > li > a').click(function(){
		$('nav.heading ul li a').removeClass('active');
		$('a#' + $(this).attr('attr-parent') ).addClass('active');
	});
});
