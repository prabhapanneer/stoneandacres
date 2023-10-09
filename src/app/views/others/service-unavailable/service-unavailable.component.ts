import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StoreApiService } from '../../../services/store-api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-service-unavailable',
  templateUrl: './service-unavailable.component.html',
  styleUrls: ['./service-unavailable.component.scss']
})

export class ServiceUnavailableComponent implements OnInit {

  template_setting: any = environment.template_setting;
  
  constructor(private router: Router, private storeApi: StoreApiService) { }

  ngOnInit(): void {
    if(this.storeApi.store_id) {
      this.storeApi.STORE_STATUS().subscribe(result => {
        if(result.status) this.router.navigate(['/']);
      });
    }
  }

}