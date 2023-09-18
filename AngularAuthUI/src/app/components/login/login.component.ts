import { Component } from '@angular/core';

import {FormBuilder,FormGroup,Validators,FormControl} from '@angular/forms'
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import ValidateForm from 'src/app/helpers/validateform';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  type:string = "password";
  isText:boolean = false;
  eyeIcon:string = "fa fa-eye-slash";

  loginForm!: FormGroup;

  constructor(private fb : FormBuilder,private auth:AuthService,private router:Router,private toast : NgToastService,private userStore:UserStoreService)
  {
      this.loginForm = fb.group({
        username: ['',Validators.required],
        password: ['',Validators.required]
      })
  }

  onLogin(){
    //console.log("onSubmit Called")
    if(this.loginForm.valid){
      console.log(this.loginForm.value);
      //send object to database
      this.auth.login(this.loginForm.value)
      .subscribe({
        next: (res)=>{
          //alert(res.message)
          this.toast.success({detail:"SUCESS",summary:res.message,duration: 5000});
          this.loginForm.reset();
          this.auth.storeToken(res.token);
          const tokenPayload = this.auth.decodeToken();
          this.userStore.setFullNameFromStore(tokenPayload.name);
          this.userStore.setRoleForStore(tokenPayload.role);
          this.router.navigate(['dashboard']);
        },
        error:(err)=>{
          //alert(err?.error.message)
          this.toast.error({detail:"ERROR",summary:err?.error.message,duration: 5000});
        }
      })
    }
    else{
      console.log("form is not valid")
      //throw error using toster and required field
      ValidateForm.validateAllFormFields(this.loginForm);
      this.toast.error({detail:"ERROR",summary:"your form is invalid",duration: 5000});
      //alert("")
    }
  }

      hideShowPass(){
        this.isText = ! this.isText;

        this.isText ? this.eyeIcon = 'fa-eye' : this.eyeIcon = 'fa-eye-slash';

        this.isText ? this.type = 'text' : this.type = 'password';
      }
}
