import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  store_id: string = this.gs.storeId;
  ws_url: string = this.gs.wsUrl;

  constructor(private http: HttpClient, private gs: GlobalService) { }

  LAYOUT_LIST() { return this.http.get<any>(this.ws_url+'/store_details/layouts?store_id='+this.store_id); }
  HOME_PAGE_BLOG_LIST(limit) { return this.http.get<any>(this.ws_url+'/store_details/blogs?limit='+limit+'&store_id='+this.store_id); }
  INSTAGRAM(x) { return this.http.get<any>('https://graph.instagram.com/me/media?limit=15&fields=id,caption,media_url,media_type,permalink,thumbnail_url,timestamp&access_token='+x); }

  AI_STYLES() { return this.http.get<any>(this.ws_url+'/store_details/ai_styles?store_id='+this.store_id); }

}