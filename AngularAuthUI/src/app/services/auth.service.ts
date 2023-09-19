import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { Router } from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt'
import { TokenApiModel } from '../models/token-api.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl : string = "https://localhost:7218/api/User/"

  private userPayload:any;

  constructor(private http : HttpClient,private router : Router) {
    this.userPayload = this.decodeToken();
   }

  signUp(userObj:any){
    return this.http.post<any>(`${this.baseUrl}register`,userObj)
  }

  login(loginObj:{username: string, password: string}){
    return this.http.post<any>(`${this.baseUrl}authenticate`,loginObj)
  }

  storeToken(tokenValue:string){
    localStorage.setItem('token',tokenValue)
  }

  storeRefreshToken(tokenValue:string){
    localStorage.setItem('refreshToken',tokenValue)
  }

  getToken(){
    return localStorage.getItem('token');
  }

  getRefreshToken(){
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean{
    return !! localStorage.getItem('token');
  }

  signout(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  decodeToken(){
    const jwtHelper = new JwtHelperService();
    const token = this.getToken()!;
    console.log( `Decoded token = ${JSON.stringify(jwtHelper.decodeToken(token))}`)
    return jwtHelper.decodeToken(token);
  }


  getFullNameFromToken(){
    if(this.userPayload){
      return this.userPayload.name;
    }
  }

  getRoleFromToken(){
    if(this.userPayload){
      return this.userPayload.role;
    }
  }

  renewToken(tokenApi : TokenApiModel){
    return this.http.post<any>(`${this.baseUrl}refresh`,tokenApi);
  }

}
