import { Directive, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwiperService } from '../../../services/swiper.service';
declare const Swiper: any;
declare const $: any;
​
@Directive({
  selector: '[appHomeSwiper]'
})

export class HomeSwiperDirective {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private _element: ElementRef, private swiperService: SwiperService) { }
​
  ngAfterViewInit() {
    let classList: any = this._element.nativeElement.classList;
    for(let i=0; i<classList.length; i++) {
      if(classList[i].includes("carousal_") || classList[i].includes("slider_")) {
        let swipeElement = classList[i];
        if(isPlatformBrowser(this.platformId)) {
          // carousal (main slider & multi-highlighted section)
          if(swipeElement.includes("carousal_")) {
            new Swiper('.'+swipeElement, {
              speed: 700,
              loop: true,
              autoplay: {
                delay: 3000,
                disableOnInteraction: false
              },
              pagination: {
                el: '#swipe_pagination_'+swipeElement.split("_")[1],
                clickable: true
              },
              navigation: {
                nextEl: '#swipe_next_'+swipeElement.split("_")[1],
                prevEl: '#swipe_prev_'+swipeElement.split("_")[1]
              }
            });
          }
          // slider
          else {
            // multi-tab
            if(swipeElement.includes("tab")) {
              setTimeout(() => {
                this.initializeSwiper(swipeElement, this.swiperService.multi_tab_featured_products.break_points, this.swiperService.multi_tab_featured_products.auto_play);
              }, 0);
            }
            else if(swipeElement.includes("testimonial")) this.initializeSwiper(swipeElement, this.swiperService.testimonial.break_points, this.swiperService.testimonial.auto_play);
            else if(swipeElement.includes("blog")) this.initializeSwiper(swipeElement, this.swiperService.blogs.break_points, this.swiperService.blogs.auto_play);
            else if(swipeElement.includes("feasec")) this.initializeSwiper(swipeElement, this.swiperService.featured_section.break_points, this.swiperService.featured_section.auto_play);
            else if(swipeElement.includes("shoplook")) this.initializeSwiper(swipeElement, this.swiperService.shop_look.break_points, this.swiperService.shop_look.auto_play);
            else this.initializeSwiper(swipeElement, this.swiperService.featured_products.break_points, this.swiperService.featured_products.auto_play);
          }
        }
        break;
      }
    }
  }

  initializeSwiper(swipeElement, breakPts, autoPlay) {
    // swiper config
    let swipeConfig: any = {
      speed: 500,
      breakpoints: breakPts,
      navigation: {
        nextEl: '#swipe_next_'+swipeElement.split("_")[1],
        prevEl: '#swipe_prev_'+swipeElement.split("_")[1]
      }
    }
    if(autoPlay) {
      swipeConfig.autoplay = {
        delay: 3000,
        disableOnInteraction: false
      }
    }
    // initialize swiper
    new Swiper('.'+swipeElement, swipeConfig);
    // hover event
    if(autoPlay && swipeElement.includes("desktop")) {
      $('.'+swipeElement).hover(function () {
        (this).swiper.autoplay.stop();
      }, function () {
        (this).swiper.autoplay.start();
      });
    }
  }
​
}