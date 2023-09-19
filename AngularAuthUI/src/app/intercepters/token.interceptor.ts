import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable,catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { TokenApiModel } from '../models/token-api.model';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService,private toast:NgToastService,private router:Router) {}
 // use interceptor to modify the get request header to append the token with the request
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const myToken = this.auth.getToken();

    if(myToken){
      request = request.clone({
        setHeaders:{Authorization:`Bearer ${myToken}`}
      })
    }

    return next.handle(request).pipe(
      catchError((err:any)=>{
        if(err instanceof HttpErrorResponse){
          if(err.status === 401){
            // this.toast.warning({detail:"Warning",summary:"Token is expired, Login again"})
            // this.router.navigate(['/login'])

            //handle request
            return this.handleUnauthorizedError(request,next);
          }
        }
        return throwError(()=> new Error("Some other error occured"))
      })
    );
  }

  handleUnauthorizedError(req : HttpRequest<any>,next : HttpHandler){
    const accesstoken = this.auth.getToken()!;
    const refreshtoken = this.auth.getRefreshToken()!;
    
    const tokenApiModel = new TokenApiModel();

    tokenApiModel.accessToken = accesstoken;
    tokenApiModel.refreshToken = refreshtoken;

    return this.auth.renewToken(tokenApiModel)
      .pipe(
        switchMap((data) => {
          console.log(`Token Recieved on refresh accessToken : ${data.accessToken} refreshToken : ${data.refreshToken}`);

          this.auth.storeRefreshToken(data.refreshToken);
          this.auth.storeToken(data.accessToken);
          req = req.clone({
            setHeaders: {Authorization : `Bearer ${data.accessToken}`}
          });
          return next.handle(req);
        }),
        catchError((err) => {
          return throwError(() => {
            this.toast.warning({detail:"Warning",summary:"Token is expired, Login again"})
            this.router.navigate(['/login'])
          })
        })
      )
  }

}
