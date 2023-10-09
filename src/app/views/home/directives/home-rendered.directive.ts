import { Directive, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appHomeRendered]'
})

export class HomeRenderedDirective {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private document) { }

  ngOnInit() {
    if(isPlatformBrowser(this.platformId)) {
      let bgElem = this.document.getElementById('pre-bg');
      if(bgElem && bgElem.style.display != "none") bgElem.style.display = "none";
    }
  }

}