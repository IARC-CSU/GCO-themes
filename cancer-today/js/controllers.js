// all globocan controllers
var GlobocanControllers = angular.module('GlobocanControllers', []);

GlobocanControllers.controller( 'HeadCtrl' , ['$scope', '$http', '$location', 
	
	function ($scope, $http , $location) {
      
  }]

);

var url_save_pdf ; 

GlobocanControllers.controller('DataVizController', [ '$scope' , '$http' , '$rootScope', '$timeout', '$window' , '$compile' , '$cookieStore' , 

  function ( $scope, $http, $rootScope , $timeout , $window , $compile , $cookieStore ) {
        
    // remove sidebar + sub nav 
    $scope.window = angular.element( $window );
    $scope.zoom = 4 ; 

    $scope.cookie_slides = $cookieStore.get('slides') ;  

    $scope.resizeDivSvg = function(){

      if ( $('md-content.container-filter').hasClass('closed') == true )
      {
        $scope.width = $(window).width() - ( WIDTH_SUBMENU - 10) ;
        $scope.width_bars_ranking = $(window).width() - ( WIDTH_SUBMENU - 100) ;
      }
      else
      {
        $scope.width = $(window).width() - ( WIDTH_STD - WIDTH_SUBMENU + 10  ) ;
        $scope.width_bars_ranking = $(window).width() - ( WIDTH_STD - WIDTH_SUBMENU - 50) ;
      }
    }

    $scope.printGraph = function( parameters ){
      
      // console.info( type_ext , type_graph , scopeSVG , button , embed ) ;
      // printGraph( parameters.ext , parameters.type , null , null , null , true );

      let save_str = ( parameters.save == true ) ? 'save=1' : 'save=0' ; 

      let search_str = document.location.search ; 
      search_str = search_str.replace('?','?zoom='+$scope.zoom+'&graphic='+parameters.type+'&extension=' + parameters.ext +'&');

      if ( CanMapRotate != undefined ) search_str += '&rotate='+CanMapRotate ; 

      let base_uri = URI_DOWNLOAD_SRC +  search_str   ; 
      let url_encoded = encodeURIComponent( base_uri ) ; 

      let graphic_title = encodeURIComponent( $('#chart-title').html() ) ;
      console.info( base_uri ) ; // return ;
      
      // console.info( URI_DOWNLOAD_SRC + document.location.search ) ; 
      // console.info( url_encoded ) ; 
      // console.info( URL_DOWNLOAD + 'screenshot?url=' + url_encoded ) ; 

      // by default, we launch the url so the file is downloaded through the browser

      if ( parameters.save == true )
      {
        let url_dl = URL_PRINT ; 

        switch( parameters.ext )
        {
          case 'png' : 
            url_dl += '-json?type_ext=png&'+save_str+'&title='+graphic_title+'&url=' + url_encoded ; 
            break ; 

          /*case 'pdf' : 
            url_dl += '/pdf?url=' + url_encoded ; 
            break ; */
        }

        return URL_ORIGIN + url_dl ; 
      }
      else
      {
        var txtSpinner = 'Please wait while generating the '+parameters.ext+' file' ; 

        $('#spinLoading span').text(txtSpinner); 
        $('.overlay').fadeIn() ;

        let url_dl = URL_PRINT ;  // document.location.href 

        switch( parameters.ext )
        {
          case 'png' : 
            url_dl += /*URL_DOWNLOAD +*/ '?type_ext=png&'+save_str+'&url=' + url_encoded ; 
            break ; 

          case 'pdf' : 
            url_dl += /*URL_DOWNLOAD +*/ '?type_ext=pdf&url=' + url_encoded+'&zoom=4' ; 
            break ; 

          case 'pptx': 
            url_dl += /*URL_DOWNLOAD +*/ '?type_ext=pptx&url=' + url_encoded+'&title='+graphic_title  ; 
            break ; 
        } // end swith

        window.location.href = URL_ORIGIN + url_dl ; 
        // console.info( URL_ORIGIN + url_dl ) ; 
        // console.info( 'http://www.gco.local:8080/print/dl?type_ext=' + parameters.ext + '&url=' + url_encoded + '&zoom=4&title='+graphic_title ) ; 

        $timeout( function(){ $('.overlay').fadeOut() ; }, 3000 );
      }

    } // and print graph

    $scope.slides = (  $scope.cookie_slides != undefined ) ?  JSON.parse( $scope.cookie_slides ) : [] ;  

    // console.info("Get slides from cookie", $scope.slides ) ; 

    // copy clipboard
    new Clipboard('.btn_permalink', {
        text: function(trigger) {
            // console.info('Trigger',trigger);
            $('a.btn_permalink').attr( 'data-original-title' , 'Permalink copied !' ) ;
            $('a.btn_permalink').tooltip('show'); 
            // $('.md-tooltip-permalink').addClass('hide');
            $('a.btn_permalink').attr( 'data-original-title' , 'Copy the permalink' ) ;
            return document.URL ;
        }
    });

    $scope.shareTwitter = function(){

      let text = 'CANCER TODAY: '+$('h2#chart-title').text() ; 
      let url = encodeURIComponent(document.URL) ; 
      window.open('https://twitter.com/intent/tweet?text='+text+'&url='+url+'&via=IARCWHO');
    }

    $scope.shareLinkedin = function(){

      let text = 'CANCER TODAY: '+$('h2#chart-title').text() ; 
      let url = encodeURIComponent(document.URL) ; 
      window.open('https://www.linkedin.com/shareArticle?mini=true&url='+url+'&text='+text);
    }

    $scope.addPrintSlide = function( type ){

      var txtSpinner = 'Please wait while generating the '+type+' file' ; 
      $('#spinLoading span').text(txtSpinner);

      // overlay 
      $('.overlay').fadeIn() ;

      $scope.URL_DOWNLOAD = URL_DOWNLOAD ; 

      let url_save_screenshot = $scope.printGraph({ ext : 'png' , 'save' : true , 'type' : type }) ; 
      // let url_save_pdf        = $scope.printGraph({ ext : 'pdf' , 'save' : true , 'type' : type }) ; 
      
      // console.info("==>",url_save_screenshot);
      $http.get( url_save_screenshot ).success( function(data) {

        
        $scope.slides.push( data  ) ; 
      
        console.info("Slide after adding",$scope.slides) ; 

        $('#modalSlides').modal('show') ;
        $('.overlay').fadeOut() ; 

        $timeout(function(){
          $scope.displaySlideInModal();
        }, 500 );
        
      });

      
    }

    $scope.openModalSlides = function(){

      $scope.displaySlideInModal();
      $('#modalSlides').modal('show');
    }


    $scope.displaySlideInModal = function(){


      // empty html selection 
      $('#slide_selections').html(' '); 

      // prepare slides selections el 
      let el = $('#slide_selections') ; 
      let html_slide = '' ; 

      for( var slide in $scope.slides )
      {
        html_slide  += '<div class="col-md-3 slide">' ; 
        html_slide  += '<a href="#" ng-click="removeSlide(\''+$scope.slides[slide].url+'\')"><i class="fa fa-times"></i></a>' ; 
        console.info( URL_DOWNLOAD + $scope.slides[slide].url_thumb , URL_DOWNLOAD + $scope.slides[slide].url ) ; 
        html_slide  += '<img src="'+ URL_DOWNLOAD + $scope.slides[slide].url_thumb +'" title="'+slide+'">' ; 
        html_slide  += '</div>' ; 

        

        // $('#slide_selections').append( html_slide ) ; 
      }

      angular.element(el).append( $compile( html_slide )($scope) ) ; 
      // el.append( html_slide ) ; 

      // save cookies
      // console.info( "before writing cookie" , $scope.slides ) ; 
      $cookieStore.put( 'slides' , JSON.stringify( $scope.slides ) ) ; 

    }

  
    $scope.removeSlide = function ( picture ){

      $http.get( URL_DOWNLOAD+'remove?picture=' + picture ).success( function(data){

        for( var slide in $scope.slides )
        {
          if ( $scope.slides[slide].url == picture )
          {
            delete $scope.slides[slide] ; 
          }
        }

        $scope.slides = $scope.slides.filter( function(d){ return d });

        console.info("Slide after deleting",$scope.slides) ; 

        $scope.displaySlideInModal(); 

      }); 
    }

    $scope.clearSlides = function( picture ){

      let str_slides = JSON.stringify( $scope.slides ) ; 

      $http.get( URL_DOWNLOAD+'remove_all_slides?pictures=' + str_slides ).success( function(data){

        $scope.slides = [] ; 
        $scope.displaySlideInModal(); 

      });
    }

    // run one time
    $scope.resizeDivSvg() ; 

    $scope.window.bind('resize', function () {
      
      $scope.resizeDivSvg() ;
      
      onWindowResizeItems(); 

    });

  }]

);

GlobocanControllers.controller('ModalCtrl', [ '$scope' , '$http' , '$rootScope', '$timeout', '$window' , '$compile' , 

  function ( $scope, $http, $rootScope , $timeout , $window , $compile ) {

    $scope.ext = 'pptx' ; // pptx | zip | pdf
    $scope.quality = 'hd' ; 
    $scope.format = '16_9' ; 
    $scope.layout = 'landscape' ; // only for pdf

    $scope.download = function(){

      $scope.saveSlides({
        ext : $scope.ext , 
        quality : $scope.quality ,
        format : $scope.format , 
        layout : $scope.layout
      }) ; 

    }

    $scope.saveSlides = function( params ){

      $scope.cookie_slides = $cookieStore.get('slides') ;  
      $scope.slides = (  $scope.cookie_slides != undefined ) ?  JSON.parse( $scope.cookie_slides ) : [] ;  

      console.info( "Get slides before generating doc" , $scope.slides ) ; 


      let zoom = ( params.quality == 'ld' ) ? 0 : 4 ; 
      let str_slides = encodeURIComponent( JSON.stringify( $scope.slides ) ) ; 
      let url_dl = URL_DOWNLOAD + 'save_all_slides?ext=' + params.ext + '&pictures=' + str_slides  ; 

      document.location.href = url_dl ; 

      // console.info( URL_DOWNLOAD+'save_all_slides?type=' + type + '&pictures=' + str_slides ) ; 

      /*let data_post = {
        ext       : ext , 
        pictures  : $scope.slides ,
        responseType: 'blob' 
      } ; 

      $http.post( URL_DOWNLOAD+'save_all_slides' , data_post ).success( function( response ){

        return response ; 

      });*/

    }

  }]

);


GlobocanControllers.controller('SidebarController', [ '$scope' , '$http' , '$rootScope', '$timeout', '$window' , 

  function ( $scope, $http, $rootScope , $timeout , $window ) {
      
    // remove sidebar + sub nav 
    $scope.window = angular.element( $window );

    $scope.sideNavOpen = true ; 

    $scope.toggleLeftFilter = function(){
      $scope.sideNavOpen = !$scope.sideNavOpen ; 
    }

  }]

);


var closeNavMobile = true ;

GlobocanControllers.controller( 'MainCtrl' , ['$scope', '$http', '$location' , '$log' , '$timeout', '$interval' , '$rootScope' , 
	
	function ($scope, $http , $location , $log , $timeout , $interval , $rootScope  ) {
    
    $scope.toggleLeftSideNav = function(){
      
      // toggle class closed
      $('md-content.container-filter,md-sidenav.filters.closed,md-sidenav.md-sidenav-left,#toggle-left-bar').toggleClass('closed');

      // recalculate container
      let datavizController = angular.element( $('md-content[ng-controller="DataVizController"]') ).scope() ;


      if ( $('md-content.container-filter').hasClass('closed') == true )
      {
        datavizController.width = $(window).width() - ( WIDTH_SUBMENU + 10 )  ;
        datavizController.width_bars_ranking = datavizController.width  ;
      }
      else
      {
        datavizController.width = $(window).width() - ( WIDTH_STD - WIDTH_SUBMENU + 10 ) ;
        datavizController.width_bars_ranking = datavizController.width   ;
      }

      // console.info(datavizController.width_bars_ranking,datavizController.width);

      datavizController.height = $(window).height() - HEIGHT_STD + 100  ; 
      
      // console.info( datavizController.width)  ;
      // dispatch an event to the child controller (specific to viz)
      datavizController.resizeChart( datavizController.width ) ; 

      // redifine items size on the right
      onWindowResizeItems();

    }

    $scope.toggleLeftSideNav2 = function(){
      
      // toggle class closed
      $('div.container-filter,md-sidenav.md-sidenav-left,#toggle-left-bar').toggleClass('closed');

      // recalculate container
      let datavizController = angular.element( $('md-content[ng-controller="DataVizController"]') ).scope() ;

    }

		$('[data-toggle="tooltip"]').tooltip() ;

    
    // about button 
    $('#buttonAbout,#mobileButtonAbout').click(function(){
      $('#modalAbout').modal('show');
    });

    // button take a tour : see index.html
    $('a.tat').click(function(){
      $('#modalTakeATour').modal('hide');
      $('#modalTakeATourVideo').modal('show');
    });

    // close modal with cross button or save settings
    $('.closemodal,.save_settings').click(function(){
      $('.modal').modal('hide');
    })

    $('#btnFactSheets,.sub-menu-fact-sheets').hover(function(){
      $('.sub-menu-fact-sheets').addClass('active');
    },function(){
      $('.sub-menu-fact-sheets').removeClass('active');
    }) ; 

    $scope.showFactSheetsModal = function(){
      $('#modal-fact-sheets').modal('show') ;
    }

    $scope.closeFactSheetsModal = function(){
      $('#modal-fact-sheets').modal('hide') ;
    }

    $scope.isActive = function (viewLocation) {

      if( typeof(viewLocation) == 'object')
        var active = $.inArray( $location.path() , viewLocation ) != -1 ;
      else
        var active = ( viewLocation === $location.path() );

      return active;
    };

    $scope.toggleRight = buildToggler('mobileNav');
    $scope.isOpenRight = function(){
      return $mdSidenav('mobileNav').isOpen();
    };

  
    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;
      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
      return debounce(function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }
    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            // $('#mobileNav').toggle();
          });
      }
    }

    $scope.clickChoose = function(){
      
      $rootScope.$broadcast( 'updateModalPopulation', { 'population' : $scope.population_modal } );

    }

    $scope.showCountry = function( index , id_population , label_population ,  sub_countries ){
      
      if ( index == 1 ) 
      {
        $scope.sub_countries = sortByKey( sub_countries , 'title' , 'ASC' )  ; 
      }

      $scope.chooseCountry(id_population,label_population) ; 
    }

    $scope.selectFilter = function( variable , value ){
        
      // if ( variable == 'sort_cancers') $scope.sort_cancers = value ; 
      
    }


    // function savings new settings
    $scope.saveSettings = function(){

      /*Default.sex = $scope.sex ; 
      Default.type = $scope.type  ; 
      Default.mode_population = $scope.mode_population  ; 
      Default.population = $scope.population ; 
      Default.cancer = $scope.cancer ; */
      Default.sort_cancer_label = $scope.sort_cancer_label  ; 

      // save cookies
      $cookieStore.put( 'settings' , Default ) ; 
      
      // emit / update to filters
      $rootScope.$broadcast( 'updateSettings', { 'settings' : Default } );

    }

    $scope.chooseCountry = function( id_population , label_population ){

      $scope.population_modal = id_population ; 
      $('span#label-pop-modal').text( label_population ) ; 
    }

    $scope.closeMenu = function(){
      
      $mdSidenav('mobileNav').close() ; 
    }

    $timeout(function(){

      $('#mobileNav').removeClass('hidden'); 

      if ( $(window).width() <= 1024 )
      {  
        $('#btnMobileNav').css('display','block') ;
      }
      
      var self = this, j= 0, counter = 0;
      self.mode = 'query';
      self.activated = true;
      self.determinateValue = 30;
      self.determinateValue2 = 30;
      self.showList = [ ];
      /**
       * Turn off or on the 5 themed loaders
       */
      self.toggleActivation = function() {
          if ( !self.activated ) self.showList = [ ];
          if (  self.activated ) {
            j = counter = 0;
            self.determinateValue = 30;
            self.determinateValue2 = 30;
          }
      };
      $interval(function() {
        self.determinateValue += 1;
        self.determinateValue2 += 1.5;
        if (self.determinateValue > 100) self.determinateValue = 30;
        if (self.determinateValue2 > 100) self.determinateValue2 = 30;
          // Incrementally start animation the five (5) Indeterminate,
          // themed progress circular bars
          if ( (j < 2) && !self.showList[j] && self.activated ) {
            self.showList[j] = true;
          }
          if ( counter++ % 4 == 0 ) j++;
          // Show the indicator in the "Used within Containers" after 200ms delay
          if ( j == 2 ) self.contained = "indeterminate";
      }, 100, 0, true);
      $interval(function() {
        self.mode = (self.mode == 'query' ? 'determinate' : 'query');
      }, 7200, 0, true);

    },500);

    $timeout(function(){
      // console.info( oGlobocanData ) ; 
      // if ( oGlobocanData != undefined )
      // $scope.populations_modal = oGlobocanData.getTree({ 'full' : true }) ; 
    }, 750) ;

    // destroy
		$scope.$on('$destroy', function() {
      console.info("Destroy MainCtrl") ; 
    });

 	}]

);

/**
* Online analysis controllers
*/

GlobocanControllers.controller( 'OnlineAnalysisCtrl' , ['$scope', '$http', 'mainData' , '$location' , '$cookieStore' , '$timeout' , 
	function ( $scope, $http , mainData , $location , $cookieStore , $timeout ) {
    
    $scope.p = $cookieStore.get( 'settings' ) ; 
    if ( $scope.p == undefined ) $scope.p = { } ; 

  	// bind data
		

    $scope.type             = ( $scope.p.type == undefined ) ? 0 : $scope.p.type ; 
    $scope.cancer           = ( $scope.p.cancer == undefined ) ? Default.all_cancers_id : $scope.p.cancer ;  
    $scope.mode_population  = ( $scope.p.mode_population == undefined ) ? Default.mode_population : $scope.p.mode_population ;  
    $scope.chart            = ( $scope.p.chart == undefined ) ? 'bars' : $scope.p.chart ;
    $scope.population       = ( $scope.p.population == undefined ) ? Default.population : $scope.p.population ; 

    $scope.map_disabled     = false ; 

    $scope.col_md           = '6' ; 

    $scope.mode_explore = 'population' ; 

    $scope.settings = {
      'type' : $scope.type , 
      'cancer' : $scope.cancer , 
      'population' : $scope.population , 
      'chart' : $scope.chart , 
      'prevalence' : false , 
      'statistic' : 0 
    } ;

    $scope.default_type_charts = [
       { 'label' : 'Pie chart' , 'icon' : 'pie-chart' , 'key' : 'pie'} , 
      { 'label' : 'Bar charts' , 'icon' : 'bar-chart' , 'key' : 'bars'} , 
      { 'label' : 'Table' , 'icon' : 'table' , 'key' : 'table'}, 
      { 'label' : 'Map' , 'icon' : 'globe' , 'key' : 'map'} 
      /*{ 'label' : 'Pie' , 'icon' : 'pie-chart' , 'key' : 'pie'} , 
      { 'label' : 'Map' , 'icon' : 'globe' , 'key' : 'map'} , 
      { 'label' : 'Bars' , 'icon' : 'bar-chart' , 'key' : 'bars'} , 
      { 'label' : 'Tables' , 'icon' : 'table' , 'key' : 'table'} */
    ] ; 

    $scope.type_charts = $scope.default_type_charts ; 

    $scope.switchModeExplore = function( mode_explore ){
    
      $scope.mode_explore = mode_explore ; 

      $('div.parent-populations,div.parent-cancer').toggleClass('hidden') ; 
      
      if ( mode_explore == 'population' )
      {
         $scope.type_charts = $scope.default_type_charts ;
      }
      else{
         $scope.type_charts = [
          { 'label' : 'Pie chart' , 'icon' : 'pie-chart' , 'key' : 'pie'} , 
          { 'label' : 'Bar charts' , 'icon' : 'bar-chart' , 'key' : 'bars'} , 
          { 'label' : 'Table' , 'icon' : 'table' , 'key' : 'table'},
          //{ 'label' : 'Map' , 'icon' : 'globe' , 'key' : 'map'} 
        ] ; 
      }
    }

    $scope.setVar = function( variable , value ){
      $scope.settings[ variable ] = value ; 
    }

    $scope.goToChart = function(){
      
      $scope.url = '' ; 
      $scope.parameters = 'mode='+$scope.mode_explore+'&type=' +$scope.settings.type+ '&cancer=' +$scope.settings.cancer+ '&population=' + $scope.settings.population ;  
      
      switch( $scope.chart )
      {
        case 'pie'    : $scope.url = '/online-analysis-pie' ; break ; 
        case 'bars'   : $scope.url = '/online-analysis-multi-bars' ; break ; 
        case 'map'    : $scope.url = '/online-analysis-map' ; break ; 
        case 'table'  : $scope.url = '/online-analysis-table' ; break ; 
      }

      // update cookies
      /*$cookieStore.put( 'settings' , {
        'mode' : $scope.mode , 
        'mode_population' : $scope.mode_population , 
        'population'  : $scope.settings.population , 
        'sex'         : $scope.settings.sex , 
        'type'        : $scope.settings.type , 
        'cancer'      : $scope.settings.cancer , 
        'prevalence'  : $scope.settings.prevalence , 
        'statistic'   : $scope.settings.statistic , 
        'chart'       : $scope.settings.chart
      }) ; */

      $location.url( $scope.url + '?' + $scope.parameters ) ; 
    }

    $timeout(function(){

      $scope.cancers    = mainData.cancers_ordered ; 
      $scope.populations  = {
        'continents ' : mainData.continents , 
        'countries'   : mainData.countries , 
        'regions'   : mainData.regions
      } ; 
      var countries = [] ; 
      for (var h in mainData.countries) countries.push( mainData.countries[h] );
      $scope.populations = countries ; 

    },500) ; 

		// recalculate div size
    callBackLoad({ 'hideBodyScroll' : true });

    $scope.$on('$destroy', function() {

    });
    
    // show scroll bar
    // showBodyScroll() ; 
      
  }]
);


/**
* Home controllers
*/
GlobocanControllers.controller( 'HomeCtrl' , ['$scope', '$http', '$timeout' , '$location',
	
	function ($scope, $http , $timeout , $location) {

    $scope.height_item = ( $(window).height() - 80 - 25 - ( 4 * 10 ) ) / 3  ; 
    $scope.height_item_image = ( $scope.height_item  * 2 ) - 100 ; 
    $scope.margin_top_tile = ( $scope.height_item / 4 ) ;
    $scope.margin_top_tile2 = ( $scope.height_item / 8 ) ;
    $scope.margin_top_tile3 = ( $scope.height_item * 2 ) ;


		// bind data-toggle
		$scope.$parent.version = 'today' ; 
   	$scope.$parent.hideMenu = 0 ; 
    $scope.$parent.meta_title = 'Home' ; 

    $scope.isMobileTablet = ( $(window).width() < 768 ) ? true : false ; 

  	// resizeHomeBox() ; 
  	$('a[data-toggle="tooltip"]').tooltip() ;

  	$('a.tat').click(function(){
  		// $('#modalTakeATourVideo').modal('show'); 

      //e.preventDefault();
      var url = $(this).attr('href');
      $(".modal-body").html('<iframe width="100%" height="820" frameborder="0" scrolling="no" allowtransparency="true" src="/today/take-a-tour.html"></iframe>');

  	}) ; 

    $scope.icons_dataviz = [
      { 'title' : 'Multi bars' , 'offset' : 'col-md-offset-1' ,  'active' : 'active' , 'icon' : 'img/icons/svg/orange/bar.svg' , 'link' : 'online-analysis-multi-bars' } , 
      { 'title' : 'Pie chart' , 'offset' : undefined , 'active' : 'active' , 'icon' : 'img/icons/svg/orange/pie_chart.svg' , 'link' : 'online-analysis-pie' } , 
      { 'title' : 'Dual bars' , 'offset' : undefined , 'active' : 'active' , 'icon' : 'img/icons/svg/orange/dual.svg' , 'link' : 'online-analysis-dual-bars-2' } , 
      { 'title' : 'Maps' , 'offset' : undefined , 'active' : 'active' , 'icon' : 'img/icons/svg/orange/connection_map.svg' , 'link' : 'online-analysis-map' } , 
      { 'title' : 'Globe' , 'offset' : undefined , 'class' : ' globe_icon' , 'active' : 'active' , 'icon' : 'img/icons/svg/orange/globe.svg' , 'link' : 'online-analysis-map?projection=globe' } , 
      { 'title' : 'Tree map' , 'offset' : 'col-md-offset-1' ,  'active' : 'active' , 'icon' : 'img/icons/svg/orange/treemap.svg' , 'link' : 'online-analysis-treemap' } , 
      { 'title' : 'Scatter plot' , 'offset' : undefined , 'active' : 'active' , 'icon' : 'img/icons/svg/orange/scatterplot.svg' , 'link' : 'online-analysis-scatter-plot' } , 
      { 'title' : 'Table' , 'offset' : undefined , 'active' : 'active' , 'icon' : 'img/icons/svg/orange/time_table.svg' , 'link' : 'online-analysis-table' } , 
      { 'title' : 'Sunburst' , 'offset' : undefined , 'active' : 'active' , 'icon' : 'img/icons/svg/orange/sunburst.svg' , 'link' : 'online-analysis-sunburst' },
            { 'title' : 'Circle packing' , 'offset' : undefined , 'active' : 'active' , 'icon' : 'img/icons/svg/orange/circle_packing.svg' , 'link' : 'online-analysis-circle-packing' } ,
    ] ; 

  	// var data = oGlobocanData.getByCancers( settings , false ) ; 
  	// console.info( settings , data ); */

  	$scope.slides1 = {
  		'interval' : 5000 , 
  		'data' : [
  			{ 'title' : 'Circle pack' , 'active' : 'active' , 'url' : 'img/home/circle-pack.png' , 'link' : 'online-analysis-circle-packing' } , 
  			{ 'title' : 'Treemap' , 'active' : '' ,  'url' : 'img/home/treemap.png' , 'link' : 'online-analysis-treemap'} , 
  			{ 'title' : 'Triangle' , 'active' : '' ,  'url' : 'img/home/triangle.png' , 'link' : 'online-analysis-pyramid'}
  		]
  	} ;

  	$scope.slides2 = {
  		'interval' : 7500 , 
  		'data' : [
  			{ 'title' : 'Sunburst' , 'active' : 'active' , 'url' : 'img/home/sunburst.png' , 'link' : 'online-analysis-sunburst' } , 
  			{ 'title' : 'Dot matrix' , 'active' : '' ,  'url' : 'img/home/dot.png' , 'link' : 'online-analysis-dot-matrix'} , 
  			{ 'title' : 'Parralel sets' , 'active' : '' ,  'url' : 'img/home/parsets.png' , 'link' : 'online-analysis-parset'}
  		]
  	} ;

    $scope.slides3 = {
      'interval' : 2000 , 
      'data' : [
        { 'title' : 'Simple bars' , 'active' : 'active' , 'url' : 'img/home/bar-2.png' , 'link' : 'online-analysis-multi-bars' } , 
        { 'title' : 'Parralel sets' , 'active' : '' ,  'url' : 'img/home/parsets.png' , 'link' : 'online-analysis-parset' } , 
        { 'title' : 'Pie' , 'active' : '' , 'url' : 'img/home/pie-2.png' , 'link' : 'online-analysis-pie' } , 
        { 'title' : 'Treemap' , 'active' : '' ,  'url' : 'img/home/treemap.png' , 'link' : 'online-analysis-treemap' } , 
        { 'title' : 'Globe' , 'active' : '' ,  'url' : 'img/home/globe.png' , 'link' : 'online-analysis-globe' } , 
        { 'title' : 'Circle pack' , 'active' : '' ,  'url' : 'img/home/circle-pack.png' , 'link' : 'online-analysis-circle-pack' } , 
        { 'title' : 'Map' , 'active' : '' ,  'url' : 'img/home/map.png' , 'link' : 'online-analysis-map' } , 
      ]
    } ; 

  	$timeout( function(){
  		
      
  		/*$('a.globe-pic img').hover(function(){
  			$(this).attr('src', $(this).attr('attr-animated') ) ; 
  		},function(){
  			$(this).attr('src', $(this).attr('attr-static') ) ; 
  		});
      $('a.tat').click(function(){
        $('#modalTakeATour').modal('hide');
        $('#modalTakeATourVideo').modal('show');
      });*/

      $('img.hover-anim').hover(function(){
        var src = $(this).attr('src') ;
        $(this).attr('src' , src.replace('.png','.gif')) ; 
      },function(){
        var src = $(this).attr('src') ;
        $(this).attr('src' , src.replace('.gif','.png')) ; 
      }) ;

      /*$('a.hover-anim-title').hover(function(){
        var src = $(this).children().attr('src') ;
        console.info(src) ;
        $(this).attr('src' , src.replace('.png','.gif')) ; 
      },function(){
        var src = $(this).children().attr('src') ;
        $(this).attr('src' , src.replace('.gif','.png')) ; 
      }) ;*/


      $scope.titles = [ 'Parallel sets' , 'Circle packing' ,'Treemap' , 'Sunburst chart' , 'Force bubble chart' ]  ; 

      /*$('#carousel3').carousel() ; 
      $('a.btn_play').tooltip();

      $('#carousel3').on('slid.bs.carousel', function (e) {
        var index_img = $(".active", e.target).index() ; 
        $('h2#title_carousel span').fadeOut('fast',function(){
          $('h2#title_carousel span').text( $scope.titles[index_img] ).fadeIn('fast') ;
        }); 
        $('a[data-toggle="tooltip"]').tooltip();
      }) ; */

      $('md-progress-linear').addClass('hidden'); 

  	} , 200 ) ; 

    // redefined main content height
    // $('#main-content').css('overflow','hidden');
    // $('#main-content').height( $(window).height() - 80 - 25 ) ; // 80 = top bar, 25 = footer
 	
		callBackLoad() ;

    $scope.bg = '1' ; 
    $scope.fontC = '1' ; 

    $scope.changeBg = function(bg){
      let cssBg = '' ; 
      switch(bg)
      {
        case '1':
          cssBg = 'linear-gradient(to bottom right, #970707, #1f0991)' ; 
          break ; 

        case '2':
          cssBg = 'linear-gradient(to bottom right, #3a414c, #1f0991)' ; 
          break ; 

        case '3':
          cssBg = '#cccccc' ; 
          break ; 

        case '4':
          cssBg = '#ffffff' ; 
          break ; 

        case '5':
          cssBg = 'linear-gradient(to bottom right, #ffffff, #575050)' ; 
          break ;

        case '6':
          cssBg = 'linear-gradient(to bottom right, #ffa147, #0b80b7)' ; 
          break ; 

        case '7':
          cssBg = 'linear-gradient(to bottom right, #ffa147, #ffffff)' ; 
          break ; 

        case '8':
          cssBg = 'linear-gradient(to bottom right, #1e4273, #ffffff)' ; 
          break ; 

        case '9':
          cssBg = 'linear-gradient(to bottom right, #0b80b7, #ffffff)' ; 
          break ; 

        case '10':
          cssBg = 'linear-gradient(to bottom right, #17b374, #ffffff)' ; 
          break ;            
      }

      $('.container-particule').css('background',cssBg); 
    }

    $scope.changeFont = function(fontC){
      let cssFont = '' ; 
      switch(fontC)
      {
        case '1':
          cssFont = '#ffffff' ; 
          break ; 

        case '2':
          cssFont = '#000000' ; 
          break ; 

        case '3':
          cssFont = '#575050' ; 
          break ; 

        case '4':
          cssFont = '#575050' ; 
          break ; 
      }

      $('.container-particule,.container-particule h1,.container-particule h2,.container-particule h3,.container-particule h4').css('color',cssFont); 
    }

    $timeout(function(){

      var url = $location.url() ; 
      if ( url == '/home-3' ) $scope.set_folder = 'set4' ; 

      $('.grid .item,.grid .grid-item-content').fadeIn('slow');

      $('.grid').isotope({
        itemSelector: '.grid-item',
        masonry: {
          columnWidth: 200
        }
      });

    } , 250 ) ; 
    
  }]
);




/**
* Help controllers
*/
GlobocanControllers.controller( 'TakeATourCtrl' , ['$scope', '$http', '$location',
  function ($scope, $http, $location ) {    

    $scope.p      = $location.search() ; 
    $('md-progress-linear').addClass('hidden') ; 
    hideBodyScroll() ; 
  }]
);


/**
* Help controllers
*/
GlobocanControllers.controller( 'HelpCtrl' , ['$scope', '$http', '$location',
	function ($scope, $http, $location ) {		

    $scope.p      = $location.search() ; 

    $scope.tab_selected = ( $scope.p.tab == undefined) ? 0 : $scope.p.tab ;

    $http.get( '/today/data/methods/registries.csv' ).then( function( registries ) {
      
      let tks_registries = CSVToArray(registries.data,';') ; 
      let html  = '' ; 

      for ( var r in tks_registries )
      {
        html += '<div class="registry"><strong>'+tks_registries[r][0]+'</strong> - '+tks_registries[r][1]+'</div>' ; 
      }

      $('#thanks_registries').append(html); 

    }); 

    $('md-progress-linear').addClass('hidden') ; 

		hideBodyScroll() ; 
  }]
);

/**
* MobileMenuCtrl controllers
*/
GlobocanControllers.controller( 'MobileMenuCtrl' , [ '$scope', '$timeout', '$log' , 
  function ($scope, $http , $log) {    
    $scope.close = function () {
      $mdSidenav('mobileNav').close()
        .then(function () {
          // $log.debug("close RIGHT is done");
        });
    };
  }]
);




