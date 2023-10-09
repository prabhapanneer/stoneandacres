import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { PropertiesService } from '../../../services/properties.service';
import { CommonService } from '../../../services/common.service';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent {

  subscribeForm: any = {};
  imgBaseUrl: string = environment.img_baseurl;
  currentYear: any = (new Date()).getFullYear();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private pApi: PropertiesService,
    public cs: CommonService, public router: Router, public gs: GlobalService
  ) { }

  onSubscribe() {
    this.subscribeForm.submit = true;
    this.subscribeForm.store_id = this.gs.storeId;
    this.pApi.SUBSCRIBE_NEWSLETTER(this.subscribeForm).subscribe(result => {
      this.subscribeForm.status = result.status;
      if(result.status) this.subscribeForm.alert_msg = "Thank you for subscribing.";
      else {
        this.subscribeForm.alert_msg = "Error! Try again later.";
        console.log("response", result);
      }
    });
  }

  linkNavigate(x) {
    if(x.link_type == 'internal') {
      this.router.navigate([x.link]);
    }
    else if(isPlatformBrowser(this.platformId) && x.link_type == 'external') {
      window.open(x.link, "_blank");
    }
  }

}