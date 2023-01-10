import { Directive, ElementRef, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DynamicAssetLoaderService } from '../../../services/dynamic-asset-loader.service';
declare const Plyr: any;

@Directive({
  selector: '[appVideoIntersection]'
})

export class VideoIntersectionDirective {
  
  private observer : IntersectionObserver;

  constructor(private _element: ElementRef, private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: Object, private assetLoader: DynamicAssetLoaderService) {}

  public ngOnInit () {
    if(isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver(entries => {
        this.checkForIntersection(entries);
      }, {});
      this.observer.observe(<Element>(this._element.nativeElement));
    }
  }

  private checkForIntersection = (entries: Array<IntersectionObserverEntry>) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if(this.checkIfIntersecting(entry)) {
        let classList = this._element.nativeElement.classList;
        for(let i=0; i<classList.length; i++) {
          if(classList[i].indexOf('uploads')!=-1) {
            this.renderer.setAttribute(this._element.nativeElement, 'src', classList[i]);
            break;
          }
        }
        let videoElem = entry.target.attributes.getNamedItem('id').value;
        let plyrConfig = {
          captions: { active: true }, 
          controls:['play-large', 'mute', 'fullscreen'],
          autoplay: false 
        };
        this.assetLoader.load('plyr-js', 'plyr-css').then(() => {
          new Plyr('#'+videoElem, plyrConfig);
        });
      }
    });
  }
  
  private checkIfIntersecting (entry: IntersectionObserverEntry) {
    return (<any>entry).isIntersecting && entry.target === this._element.nativeElement;
  }

}