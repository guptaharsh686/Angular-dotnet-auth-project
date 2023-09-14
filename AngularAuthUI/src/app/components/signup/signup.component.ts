import { Component } from '@angular/core';
import {FormGroup,FormBuilder,Validators,FormControl} from '@angular/forms'

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

  constructor(private fb: FormBuilder){
    this.signupForm = fb.group({
      firstName : ['',Validators.required],
      lastName  : ['',Validators.required],
      email     : ['',Validators.required],
      username  : ['',Validators.required],
      password  : ['',Validators.required]
    })
  }

  onSubmit(){
    if(this.signupForm.valid){
      //send to database
      console.log(this.signupForm.value);
    }else{
      console.log("Form is invalid")
      this.validateAllFormFields(this.signupForm)
      alert("your form is invalid")
    }
  }

  private validateAllFormFields(formGroup : FormGroup){
    Object.keys(formGroup.controls).forEach(field => {
      var control = formGroup.get(field);
      if(control instanceof FormControl){
        control.markAsDirty({onlySelf:true})
      }
      else if(control instanceof FormGroup){
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
