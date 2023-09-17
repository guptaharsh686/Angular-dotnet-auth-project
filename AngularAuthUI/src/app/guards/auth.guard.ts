import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';

export const authGuard: CanActivateFn = (route, state) => {
 if(inject(AuthService).isLoggedIn()){
  return true;
 }
 else{
  inject(NgToastService).error({detail:"ERROR",summary:"Please login again",});
  inject(Router).navigate(['/login']);
  return false;
 }

};


