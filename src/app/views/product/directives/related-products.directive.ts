import { Directive, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DynamicAssetLoaderService } from '../../../services/dynamic-asset-loader.service';
declare const Swiper: any;
​
@Directive({
  selector: '[appRelatedProducts]'
})

export class RelatedProductsDirective {

  private observer: any;
  private swiperInfo: any = {
    auto_play: true,
    break_points: {
      1024: { slidesPerView: 4, spaceBetween: 0 },
      768: { slidesPerView: 3, spaceBetween: 0 },
      640: { slidesPerView: 2, spaceBetween: 0 },
      320: { slidesPerView: 1.5, spaceBetween: 0 }
    }
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private _element: ElementRef, private assetLoader: DynamicAssetLoaderService) { }

  ngOnInit() {
    if(isPlatformBrowser(this.platformId)) {
      this.assetLoader.load('swiper-css', 'swiper-js').then(() => {
        this.registerListenerForDomChanges();
        this.fetchSwipeElements();
      }).catch(error => console.log("err", error));
    }
  }

  registerListenerForDomChanges() {
    this.observer = new MutationObserver(() => this.fetchSwipeElements());
    const attributes = false; const childList = true; const subtree = true;
    this.observer.observe(this._element.nativeElement, { attributes, childList, subtree });
  }

  fetchSwipeElements() {
    let classList: any = this._element.nativeElement.classList;
    for(let i=0; i<classList.length; i++) {
      if(classList[i].includes("related_prod_slider")) {
        let swipeElement = classList[i];
        // swiper config
        let swipeConfig: any = {
          speed: 500,
          breakpoints: this.swiperInfo.break_points,
          navigation: {
            nextEl: '#related_prod_next',
            prevEl: '#related_prod_prev'
          }
        }
        let autoPlay = this.swiperInfo.auto_play;
        if(autoPlay) {
          swipeConfig.autoplay = {
            delay: 3000,
            disableOnInteraction: false
          }
        }
        // initialize swiper
        let swipeInit = new Swiper('.'+swipeElement, swipeConfig);
        // hover event
        if(autoPlay && swipeElement.includes("desktop")) {
          swipeInit.el.addEventListener("mouseover", () => {  
            swipeInit.autoplay.stop();
          });
          swipeInit.el.addEventListener("mouseout", () => {   
            swipeInit.autoplay.start();
          });
        }
        break;
      }
    }
  }

  ngOnDestroy() {
    if(isPlatformBrowser(this.platformId) && this.observer) this.observer.disconnect();
  }
​
}