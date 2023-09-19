import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  users:any = [];
  role! : string;

  public fullName : string = "";
  constructor(private auth: AuthService,private apiServ : ApiService,private userStore:UserStoreService){
    this.apiServ.getUsers()
    .subscribe((res) => {
      console.log(`get users called result ${res[0].username}`);
      this.users = res;
    })

    this.userStore.getFullNameFromStore()
    .subscribe(val => {
      const fullNameFromToken = this.auth.getFullNameFromToken();
      this.fullName = val || fullNameFromToken;
    })

    this.userStore.getRoleFromStore()
    .subscribe(val => {
      console.log(`val = ${val}`);
      const roleFromToken = this.auth.getRoleFromToken();
      console.log(`roleFromToken = ${roleFromToken}`);

      this.role = val || roleFromToken;
    })
  }

  logout(){
    this.auth.signout();
  }
}
