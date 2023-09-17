import { Component } from '@angular/core';
import {FormGroup,FormBuilder,Validators,FormControl} from '@angular/forms'
import { Route, Router } from '@angular/router';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import ValidateForm from 'src/app/helpers/validateform';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  type:string = "password";
  isText:boolean = false;
  eyeIcon:string = "fa fa-eye-slash";

  signupForm !: FormGroup;

  constructor(private fb: FormBuilder,private auth:AuthService,private router:Router,private toast:NgToastService){
    this.signupForm = fb.group({
      firstName : ['',Validators.required],
      lastName  : ['',Validators.required],
      email     : ['',Validators.required],
      username  : ['',Validators.required],
      password  : ['',Validators.required]
    })
  }

  onSignUp(){
    if(this.signupForm.valid){
      //send to database
      this.auth.signUp(this.signupForm.value)
      .subscribe({
        next: (res)=>{
          //alert(res.message);
          this.toast.success({detail:"SUCESS",summary:res.message,duration: 5000});
          this.signupForm.reset();
          this.router.navigate(['login']);
        },
        error: (err)=>{
          this.toast.error({detail:"ERROR",summary:err?.error.message,duration: 5000});

        }
      })
    }else{
      console.log("Form is invalid")
      ValidateForm.validateAllFormFields(this.signupForm)
      //alert("your form is invalid")
      this.toast.error({detail:"ERROR",summary:"Form is invalid",duration: 5000});

    }
  }

  
      hideShowPass(){
        this.isText = ! this.isText;

        this.isText ? this.eyeIcon = 'fa-eye' : this.eyeIcon = 'fa-eye-slash';

        this.isText ? this.type = 'text' : this.type = 'password';
      }
}
