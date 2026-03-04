import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeetingService } from '../../services/meeting.service';
import { ChatMessage } from '../../models/chat-message.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-white rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-right duration-300">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-semibold text-gray-800 text-lg">In-call messages</h2>
        <p class="text-xs text-gray-500">Messages can only be seen by people in the call</p>
      </div>

      <!-- Messages List -->
      <div #messageContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        
        <div *ngIf="(chatMessages$ | async)?.length === 0" class="h-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
          Messages will appear here.
        </div>

        <!-- Chat bubble -->
        <div *ngFor="let msg of chatMessages$ | async" 
             class="flex flex-col"
             [ngClass]="msg.isLocal ? 'items-end' : 'items-start'">
          
          <div class="flex items-baseline gap-2 mb-1 px-1">
            <span class="text-xs font-semibold" [ngClass]="msg.isLocal ? 'text-blue-600' : 'text-gray-700'">
              {{ msg.isLocal ? 'You' : msg.senderName }}
            </span>
            <span class="text-[10px] text-gray-400">
              {{ msg.timestamp | date:'shortTime' }}
            </span>
          </div>
          
          <div class="max-w-[85%] px-4 py-2 rounded-2xl text-sm break-words shadow-sm"
               [ngClass]="msg.isLocal 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'">
            {{ msg.message }}
          </div>
          
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-gray-100">
        <form (ngSubmit)="sendMessage()" class="flex gap-2">
          <input 
            type="text" 
            [(ngModel)]="newMessage" 
            name="newMessage"
            placeholder="Send a message"
            class="flex-1 px-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-800"
            autocomplete="off"
          >
          <button 
            type="submit" 
            title="Send message"
            [disabled]="!newMessage.trim()"
            class="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center h-10 w-10">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
              <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
            </svg>
          </button>
        </form>
      </div>

    </div>
  `,
  styles: []
})
export class ChatPanelComponent implements OnInit, AfterViewChecked {

  chatMessages$!: Observable<ChatMessage[]>;
  newMessage: string = '';

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  constructor(private meetingService: MeetingService) { }

  ngOnInit(): void {
    this.chatMessages$ = this.meetingService.chatMessages$;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.meetingService.sendChatMessage(this.newMessage.trim());
      this.newMessage = '';
    }
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
