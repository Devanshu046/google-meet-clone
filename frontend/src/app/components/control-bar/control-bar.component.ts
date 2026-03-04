import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-control-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-20 flex items-center justify-center gap-4 px-6 relative">
      
      <!-- Mic Toggle -->
      <button 
        (click)="toggleMic()" 
        [title]="isMicMuted ? 'Turn on microphone' : 'Turn off microphone'"
        class="w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm"
        [ngClass]="isMicMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#3c4043] hover:bg-[#434649] text-white'">
        <svg *ngIf="!isMicMuted" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <svg *ngIf="isMicMuted" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      </button>

      <!-- Camera Toggle -->
      <button 
        (click)="toggleCam()" 
        [title]="isCamOff ? 'Turn on camera' : 'Turn off camera'"
        class="w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm"
        [ngClass]="isCamOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#3c4043] hover:bg-[#434649] text-white'">
         <svg *ngIf="!isCamOff" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
         <svg *ngIf="isCamOff" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      </button>

      <!-- Chat Toggle -->
      <button 
        (click)="toggleChat()" 
        title="Chat with everyone"
        class="w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm text-white"
        [ngClass]="isChatOpen ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-[#3c4043] hover:bg-[#434649]'">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      <!-- Leave Button -->
      <button 
        (click)="leaveMeeting()" 
        title="Leave call"
        class="w-16 h-12 bg-red-600 hover:bg-red-700 text-white rounded-[24px] flex items-center justify-center transition-colors shadow-sm ml-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
        </svg>
      </button>
    </div>
  `
})
export class ControlBarComponent {
  @Input() isMicMuted: boolean = false;
  @Input() isCamOff: boolean = false;
  @Input() isChatOpen: boolean = false;

  @Output() micToggle = new EventEmitter<void>();
  @Output() camToggle = new EventEmitter<void>();
  @Output() chatToggle = new EventEmitter<void>();
  @Output() leave = new EventEmitter<void>();

  toggleMic(): void {
    this.micToggle.emit();
  }

  toggleCam(): void {
    this.camToggle.emit();
  }

  toggleChat(): void {
    this.chatToggle.emit();
  }

  leaveMeeting(): void {
    this.leave.emit();
  }
}
