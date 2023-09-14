import { Component } from '@angular/core';

import {FormBuilder,FormGroup,Validators,FormControl} from '@angular/forms'

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

  constructor(private fb : FormBuilder)
  {
      this.loginForm = fb.group({
        username: ['',Validators.required],
        password: ['',Validators.required]
      })
  }

  onSubmit(){
    //console.log("onSubmit Called")
    if(this.loginForm.valid){
      console.log(this.loginForm.value);
      //send object to database
    }
    else{
      console.log("form is not valid")
      //throw error using toster and required field
      this.validateAllFormFields(this.loginForm);
      alert("your form is invalid")
    }
  }

  private validateAllFormFields(formGroup : FormGroup){
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if(control instanceof FormControl){
        control.markAsDirty({onlySelf:true});
      }else if(control instanceof FormGroup){
        this.validateAllFormFields(control);
      }
    })
  }


      hideShowPass(){
        this.isText = ! this.isText;

        this.isText ? this.eyeIcon = 'fa-eye' : this.eyeIcon = 'fa-eye-slash';

        this.isText ? this.type = 'text' : this.type = 'password';
      }
}
