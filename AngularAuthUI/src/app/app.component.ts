import { Component } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AngularAuthUI';

  constructor(private toast : NgToastService ){
    
  }
}
