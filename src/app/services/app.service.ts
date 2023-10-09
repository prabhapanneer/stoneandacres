import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})

export class AppService {

  store_id: string = this.gs.storeId;
  ws_url: string = this.gs.wsUrl;

  constructor(private http: HttpClient, private gs: GlobalService) { }

  IP_INFO(url) { return this.http.get<any>(url); }
  STORE_DETAILS() { return this.http.get<any>(this.ws_url+'/store_details/details_v4?store_id='+this.store_id); }

}