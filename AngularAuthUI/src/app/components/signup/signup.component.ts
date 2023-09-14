import { Component } from '@angular/core';
import {FormGroup,FormBuilder,Validators,FormControl} from '@angular/forms'
import ValidateForm from 'src/app/helpers/validateform';

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
      ValidateForm.validateAllFormFields(this.signupForm)
      alert("your form is invalid")
    }
  }

  
      hideShowPass(){
        this.isText = ! this.isText;

        this.isText ? this.eyeIcon = 'fa-eye' : this.eyeIcon = 'fa-eye-slash';

        this.isText ? this.type = 'text' : this.type = 'password';
      }
}
