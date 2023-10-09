import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Directive({
  selector: '[appThumbnail]',
  host: { '(error)':'placeholder()' }
})

export class ThumbnailDirective {

  @Input() ImagelazyLoad: any;
  public lqip_img : any;

  constructor(private _element: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    let imgArray = this.ImagelazyLoad.split(environment.img_host);
    if(imgArray.length==2) this.lqip_img = environment.img_host+imgArray[1].split('.').join('_s.');
    else this.lqip_img = this.ImagelazyLoad;
    this.setAttributes();
  }

  setAttributes() {
    if(this._element.nativeElement.localName === 'img') {
      this.renderer.setAttribute(this._element.nativeElement, 'data-src', this.lqip_img);
      this.renderer.setAttribute(this._element.nativeElement, 'src', this.lqip_img);
    }
    else {
      this.renderer.setAttribute(this._element.nativeElement, 'data-bg', this.lqip_img);
      this.renderer.setStyle(this._element.nativeElement, 'background-image', `url(${this.lqip_img})`);
    }
  }

  placeholder() {
    this.lqip_img = "assets/images/placeholder.svg";
    this.setAttributes();
  }

}