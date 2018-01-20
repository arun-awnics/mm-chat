import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from './interfaces/user';
import { UserService } from './user.service';
import { SocketService } from './socket.service';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private users: User[] = [];
  private user: User;
  constructor(
    private userService: UserService,
    private socketService: SocketService,
    private chatService: ChatService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.userService.getUsers()
    .subscribe(users => this.users = users);
  }

  hideList() {
    document.getElementById('userList').style.display = 'none';
  }

  showList() {
    document.getElementById('userList').style.display = 'inline';
  }
}
