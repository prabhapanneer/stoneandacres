import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserGuard implements CanActivate {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router : Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if(localStorage.getItem('customer_token')) {
      return true;
    }
    else {
      if(isPlatformBrowser(this.platformId)) sessionStorage.setItem("user_state", state.url);
      this.router.navigate(['/account']);
      return false;
    }
  }
  
}