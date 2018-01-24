import { Component, OnInit, AfterViewChecked, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as io from 'socket.io-client';

import { Group } from '../interfaces/group';
import { Message } from '../interfaces/message';
import { User } from '../interfaces/user';
import { ChatService } from '../chat.service';
import { GroupService } from '../group.service';
import { UserService } from '../user.service';
import { SocketService } from '../socket.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  private userId: number; // to initialize the user logged in
  private selectedUser: User;
  private selectedGroup: Group;
  private groups: Group[] = [];
  private messages: Message[] = [];
  private message: FormGroup;
  private oldGroupId = 1;
  private offset = 0;
  private socket;
  private messageAlign: boolean;
  private typingMessage: string;
  private typing = false;

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private location: Location,
    private socketService: SocketService,
    private userService: UserService,
    private appComponent: AppComponent
  ) {
  }

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('userId');
    this.userService.getUserById(this.userId)
      .subscribe(user => this.selectedUser = user);
    this.chatService.setUser(this.selectedUser);
    this.socketService.connection(this.userId);
    this.getGroups();
    this.createForm();
    this.receiveMessageFromSocket();
    this.receiveTyping();
  }

  createForm() {
    this.message = this.fb.group({
      _id: null, // message id
      receiverId: [''],
      receiverType: [''], // group or individual
      senderId: [''],
      picUrl: [''], // image of the sender or receiver
      text: [''], // message data
      type: ['text'], // type of the message(checkbox, radio, image, video, etc)
      status: ['delivered'], // delivered, read, not-delivered
      contentType: [''], // for radio, checkbox and slider
      contentData: {
        data: [''] // for radio, checkbox and slider
      },
      responseData: {
        data: [''] // for radio, checkbox and slider
      },
      createdBy: [''],
      updatedBy: [''],
      createdTime: Date.now(),
      updatedTime: Date.now()
    });
  }

  ngAfterViewChecked() {
    // this.scrollToBottom();
  }

  sendMessage({ value, valid }: { value: Message, valid: boolean }): void {
    const result = JSON.stringify(value);
    value.receiverId = this.chatService.getGroup().id;
    value.senderId = this.selectedUser.id;
    value.receiverType = 'group';
    console.log('value: ', JSON.stringify(value));
    if (value.text === '') {
      return;
    } else {
      this.socketService.sendMessage(value);
    }
    this.message.reset();
  }

  receiveMessageFromSocket() {
    this.socketService.receiveMessages()
      .subscribe((msg) => {
        if (msg.receiverId === this.selectedGroup.id) {
          this.messages.push(msg);
          if (msg.senderId === this.selectedUser.id) {
            this.messageAlign = false;
          } else {
            this.messageAlign = true;
          }
        }
      });
  }


  getGroups() {
    this.groupService.getGroups(this.userId)
      .subscribe(groups => this.groups = groups);
  }

  getMessage(group: Group) {
    this.chatService.setGroup(group);
    this.selectedGroup = group;
    const size = 20;
    if (this.oldGroupId === group.id) {
      this.chatService.getMessages(this.selectedUser.id, group.id, this.offset, size)
        .subscribe((msg) => {
          msg.reverse().map((message) => {
            this.messages.push(message);
          });
        });
    } else {
      this.messages = [];
      this.offset = 0;
      this.oldGroupId = group.id;
      this.chatService.getMessages(this.selectedUser.id, group.id, this.offset, size)
        .subscribe((msg) => {
          msg.reverse().map((message) => {
            this.messages.push(message);
          });
        });
    }
  }

  onScroll(event) {
    const position = event.target.scrollTop;
    if (position === 0) {
      this.offset = this.offset + 20;
      this.getMessage(this.selectedGroup);
    }
  }

  scrollToBottom() {
    const height = document.getElementById('messageBox');
    height.scrollTop = height.scrollHeight;
  }

  logout() {
    this.socketService.logout(this.selectedUser.id).
      subscribe((data) => {
        console.log(data.msg);
      });
    this.appComponent.showList();
  }

  sendTyping() {
    this.typing = true;
    const sender = this.selectedUser;
    const receiver = this.selectedGroup;
    const receiverType = 'group';
    this.socketService.sendTyping(sender, receiver, receiverType);
    setTimeout(() => {
      this.typing = false;
    }, 2000);
  }

  receiveTyping() {
    console.log('receiving typing message in component');
    this.socketService.receiveTyping()
    .subscribe((data) => {
      this.typingMessage =  data + ' is typing...';
    });
  }
}
