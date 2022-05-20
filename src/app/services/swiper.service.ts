import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class SwiperService {

  featured_section: any = {
    card_count: 4,
    auto_play: true,
    break_points: {
      1024: { slidesPerView: 4, spaceBetween: 0 },
      768: { slidesPerView: 3, spaceBetween: 0 },
      640: { slidesPerView: 2, spaceBetween: 0 },
      320: { slidesPerView: 1, spaceBetween: 0 }
    }
  };

  product_section: any = {
    card_count: 2,
    auto_play: true,
    break_points: {
      1024: { slidesPerView: 2, spaceBetween: 5 },
      768: { slidesPerView: 2, spaceBetween: 5 },
      640: { slidesPerView: 1, spaceBetween: 5 },
      320: { slidesPerView: 1, spaceBetween: 5 }
    }
  };

  featured_products: any = {
    card_count: 4,
    auto_play: true,
    break_points: {
      1024: { slidesPerView: 4, spaceBetween: 0 },
      768: { slidesPerView: 3, spaceBetween: 0 },
      640: { slidesPerView: 2, spaceBetween: 0 },
      320: { slidesPerView: 1, spaceBetween: 0 }
    }
  };

  multi_tab_featured_products: any = {
    card_count: 4,
    auto_play: true,
    break_points: {
      1024: { slidesPerView: 4, spaceBetween: 0 },
      768: { slidesPerView: 3, spaceBetween: 0 },
      640: { slidesPerView: 2, spaceBetween: 0 },
      320: { slidesPerView: 1, spaceBetween: 0 }
    }
  };

  testimonial: any = {
    card_count: 4,
    auto_play: true,
    break_points: {
      1024: { slidesPerView: 4, spaceBetween: 0 },
      768: { slidesPerView: 3, spaceBetween: 0 },
      640: { slidesPerView: 2, spaceBetween: 0 },
      320: { slidesPerView: 1, spaceBetween: 0 }
    }
  };
  
  blogs: any = {
    card_count: 4,
    auto_play: true,
    break_points: {
      1024: { slidesPerView: 4, spaceBetween: 0 },
      768: { slidesPerView: 3, spaceBetween: 0 },
      640: { slidesPerView: 2, spaceBetween: 0 },
      320: { slidesPerView: 1, spaceBetween: 0 }
    }
  };

  shop_look: any = {
    card_count: 4,
    auto_play: true,
    break_points: {
      1024: { slidesPerView: 4, spaceBetween: 0 },
      768: { slidesPerView: 3, spaceBetween: 0 },
      640: { slidesPerView: 2, spaceBetween: 0, freeMode: true, },
      320: { slidesPerView: 1, spaceBetween: 0, freeMode: true, }
      // 1024: { autoplay: false, slidesPerView: "auto", freeMode: true, spaceBetween: 0 },
      // 768: { autoplay: false, slidesPerView: "auto", freeMode: true, spaceBetween: 0 },     
      // 640: { autoplay: false, slidesPerView: "auto", freeMode: true, spaceBetween: 0 },
      // 320: { autoplay: false, slidesPerView: "auto", freeMode: true, spaceBetween: 0 }      
    }
  };

  related_products: any = {
    card_count: 4,
    auto_play: true,
    break_points: {
      1024: { slidesPerView: 4, spaceBetween: 0 },
      768: { slidesPerView: 3, spaceBetween: 0 },
      640: { slidesPerView: 2, spaceBetween: 0 },
      320: { slidesPerView: 1, spaceBetween: 0 }
    }
  };

  constructor() { }

}