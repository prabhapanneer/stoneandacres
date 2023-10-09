(function ($) {

  $(document).ready(function () {
    "use strict";

    //if you change this breakpoint in the style.css file (or _layout.scss if you use SASS), don't forget to update this value as well
    let MqL = 992;

    // show cart dropdown
    $(document).on('click', '#minicart-trigger', function(e) {
      e.stopPropagation();
      $(this).siblings('.cart-box').slideToggle('400');
      $(this).siblings('.cart-box').toggleClass('show');
      $(this).parents('.mini-cart').siblings().children('.cart-box').slideUp('400');
    });
    // hide cart dropdown
    $(document).on('click', '#view-btn', function() {
      $('.cart-box').slideUp('400');
    });
    $(document).on('click', 'body', function() {
      $('#cart-box').slideUp('400');
    });
    $(document).on('click', '#cart-box', function(e) {
      e.stopPropagation();
    });

    // open cart overlay
    $(document).on('click', '#sidecart-trigger', function() {
      $('.cart-overlay').show();
      $('.cart-box-overlay').css('display','block');
      $('.cart-box-overlay').removeClass('cart-dismiss');
      $('.cart-box-overlay').addClass('cart-opened');
      $("body").css({"overflow":"hidden"});
    });
    // close cart overlay
    $(document).on('click', '.cart-overlay-close, .cart-overlay', function() {
      $('.cart-overlay').hide();
      $('.cart-box-overlay').removeClass('cart-opened');
      $('.cart-box-overlay').addClass('cart-dismiss');
      $("body").css({"overflow":"visible"});
    });
    
    // hide mega menu
    $(document).on('mouseover', 'body', function(e) {
      if(!checkDesktop()) { e.preventDefault(); }
      else { closeNav(); }
    });
    $(document).on('mouseover', '.hide_menu', function(e) {
      if(!checkDesktop()) { e.preventDefault(); }
      else { closeNav(); }
    });

    $(document).on('click', '.page-container', function() {
      if($('.cd-main-content').hasClass('nav-is-visible')) {
        closeNav();
      }
    });
    $(document).on('click', '.cd-primary-nav', function(e) {
      e.stopPropagation();
    });
    
    $(document).on('click', '.cd-secondary-nav', function(e) {
      e.stopPropagation();
    });
    $(document).on('mouseover', '.cd-secondary-nav', function(e) {
      e.stopPropagation();
    });
    $(document).on('mouseover', '.cd-main-header .hover-container', function(e) {
      e.stopPropagation();
    });

    // LIKE BUTTON
    $(document).on('click', '.product-box .product-image figcaption a', function() {
      $(this).toggleClass('liked');
    });

    // SIZE SELECT
    $(document).on('click', '.product-detail .product-content .sizes li a', function() {
      $(this).toggleClass('selected');
    });

    // PRODUCT IMAGE THUMB
    $('.product-detail .product-image ul li').delegate('img', 'click', function () {
      $('#product-image').attr('src', $(this).attr('src'));
      $('#link').attr('href', $(this).attr('src'));
    });

    //-----------------------------------------Mega Menu ------------------------------------------------------//

    //mobile - open menu
    $(document).on('click', '.cd-nav-trigger',  function (e) {
      e.preventDefault();
      $('.menu-overlay').show();
      $('body').addClass('overflow-hidden');
      $('.cd-primary-nav').removeClass('nav-dismiss');
      $('.cd-primary-nav').addClass('nav-active');
      $('.cd-primary-nav').addClass('nav-is-visible');
      $('.cd-main-header').addClass('nav-is-visible');
      $('.cd-main-content').addClass('nav-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () { });
    });
    $(document).on("click", ".nav-close, .menu-overlay", function (e) {
      e.preventDefault();
      closeNav();
    });

    // reset menu
    $(document).on('click', '#reset-menu',  function () {
      closeNav();
      // close cart drop-down
      $('.cart-overlay-close').click();
      $('.cart-box').slideUp('400');
    });

    //prevent default clicking on direct children of .cd-primary-nav 
    $('.cd-primary-nav').children('.has-children').children('a').on('click', function (e) {
      e.preventDefault();
    });
    $(document).on('mouseover', '.mega-menu > a', function (e) {
      if(!checkDesktop()) { e.preventDefault(); }
      else {
        let selected = $(this);
        selected.addClass('selected').next('ul').removeClass('is-hidden').end().parent('.has-children').parent('ul').addClass('moves-out');
        setTimeout(() => {
          selected.parent('.has-children').siblings('.has-children').children('ul').addClass('is-hidden').end().children('a').removeClass('selected');
        }, 200);
        $('.cart-box').slideUp('400');
      }
    });
    //open submenu
    $(document).on('click', '.has-children > a', function (e) {
      if(!checkDesktop()) e.preventDefault();
      let selected = $(this);
      if(selected.next('ul').hasClass('is-hidden')) {
        selected.addClass('selected').next('ul').removeClass('is-hidden').end().parent('.has-children').parent('ul').addClass('moves-out');
        selected.parent('.has-children').siblings('.has-children').children('ul').addClass('is-hidden').end().children('a').removeClass('selected');
      } else {
        selected.removeClass('selected').next('ul').addClass('is-hidden').end().parent('.has-children').parent('ul').removeClass('moves-out');
      }
    });

    //submenu items - go back link
    $(document).on('click', '.go-back', function (e) {
      e.stopPropagation();
      $(this).parent('ul').addClass('is-hidden').parent('.has-children').parent('ul').removeClass('moves-out');
    });

    function closeNav() {
      $('.menu-overlay').hide();
      if(!checkDesktop()) {
        $('body').removeClass('overflow-hidden');
        $('.cd-primary-nav').removeClass('nav-active');
        $('.cd-primary-nav').addClass('nav-dismiss');
        setTimeout(() => { closeNavCont(); }, 500);
      }
      else { closeNavCont(); }
    }
    function closeNavCont() {
      $('.cd-nav-trigger').removeClass('nav-is-visible');
      $('.cd-main-header').removeClass('nav-is-visible');
      $('.cd-primary-nav').removeClass('nav-is-visible');
      $('.has-children ul').addClass('is-hidden');
      $('.has-children a').removeClass('selected');
      $('.moves-out').removeClass('moves-out');
      $('.cd-main-content').removeClass('nav-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
        $('body').removeClass('overflow-hidden');
      });
    }

    function checkDesktop() {
      //check window width (scrollbar included)
      let e = window,
        a = 'inner';
      if(!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
      }
      if(e[a + 'Width'] >= MqL) {
        return true;
      } else {
        return false;
      }
    }

  });
  
})(jQuery);