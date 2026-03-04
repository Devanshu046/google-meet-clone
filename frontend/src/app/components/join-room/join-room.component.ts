import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MeetingService } from '../../services/meeting.service';

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center lg:justify-start bg-white text-[#202124] font-sans px-6 lg:px-16 overflow-hidden">
      
      <div class="max-w-[1200px] w-full mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        <!-- Left Column (Content) -->
        <div class="w-full max-w-2xl text-center lg:text-left flex flex-col items-center lg:items-start pt-10">
          
          <h1 class="text-[36px] sm:text-[44px] leading-tight font-normal tracking-tight mb-4">
            Video calls and meetings for everyone
          </h1>
          
          <p class="text-[18px] sm:text-[22px] text-[#5f6368] mb-12 font-normal">
            Connect, collaborate, and celebrate from anywhere with Google Meet
          </p>
          
          <!-- Actions Container -->
          <div class="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start">
            
            <!-- New Meeting Button -->
            <button 
              (click)="createNewMeeting()"
              class="bg-[#1a73e8] hover:bg-[#1b66c9] hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] text-white font-medium rounded-full px-5 h-12 flex items-center justify-center gap-2 transition-all w-full sm:w-auto text-[15px]">
              <!-- Video Plus Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                 <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Zm0-80h480v-480H160v480Zm200-80h80v-120h120v-80H440v-120h-80v120H240v80h120v120ZM160-240v-480 480Z"/>
              </svg>
              New meeting
            </button>

            <!-- Input Box -->
            <div class="relative flex items-center w-full sm:w-[260px]">
              <!-- Keyboard Icon -->
              <svg class="absolute left-3 text-[#5f6368]" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                 <path d="M200-240q-33 0-56.5-23.5T120-320v-320q0-33 23.5-56.5T200-720h560q33 0 56.5 23.5T840-640v320q0 33-23.5 56.5T760-240H200Zm0-80h560v-320H200v320Zm80-200h80v-80h-80v80Zm160 0h80v-80h-80v80Zm160 0h80v-80h-80v80Zm-320 80h320v-80H280v80ZM200-320v-320 320Z"/>
              </svg>
              <input 
                type="text" 
                name="roomId"
                [(ngModel)]="roomId" 
                placeholder="Enter a code or link"
                class="w-full pl-11 pr-4 h-12 border border-[#80868b] rounded-[4px] text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] placeholder-[#5f6368] text-[15px] hover:border-[#202124] transition-colors"
                autocomplete="off"
              >
            </div>

            <!-- Join Text Button -->
            <button 
              (click)="joinMeeting()"
              [disabled]="!roomId"
              [ngClass]="roomId ? 'text-[#1a73e8] cursor-pointer hover:bg-[#f3f8ff]' : 'text-[#dadce0] cursor-default pointer-events-none'"
              class="font-medium px-4 h-12 rounded-[4px] transition-colors w-full sm:w-auto text-[15px]">
              Join
            </button>

          </div>
          
          <!-- Name Input Component (Subtle) -->
          <div class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center lg:justify-start gap-4 w-full max-w-md">
            <span class="text-[#5f6368] text-sm font-medium">Join as:</span>
            <input 
              type="text" 
              name="userName"
              [(ngModel)]="userName" 
              placeholder="Guest"
              class="text-sm border-b border-gray-300 px-2 py-1 bg-transparent focus:outline-none focus:border-[#1a73e8] flex-1 text-[#202124] transition-colors"
            >
          </div>

        </div>

        <!-- Right Column (Image placeholder optional, hides on small screens) -->
        <div class="hidden lg:flex flex-1 justify-center items-center">
            <div class="max-w-[450px] w-full aspect-square flex items-center justify-center">
                 <!-- Using standard Meet promo image -->
                 <img src="https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg" alt="Google Meet graphic" class="w-full h-full object-contain pointer-events-none">
            </div>
        </div>

      </div>
    </div>
  `
})
export class JoinRoomComponent implements OnInit {

  userName: string = '';
  roomId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private meetingService: MeetingService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['r']) {
        this.roomId = params['r'];
      }
    });

    if (this.meetingService.localStream) {
      this.meetingService.leaveMeeting();
    }
  }

  createNewMeeting(): void {
    // Generate standard Google Meet style code (e.g. abc-defg-hij)
    const segment = (len: number) => Math.random().toString(36).substring(2, 2 + len);
    this.roomId = `${segment(3)}-${segment(4)}-${segment(3)}`;
    this.joinMeeting();
  }

  joinMeeting(): void {
    // Clean input just in case they pasted a full URL
    let secureRoomId = this.roomId.trim().split('/').pop() || this.roomId.trim();

    // Assign generic name if left empty
    if (!this.userName.trim()) {
      this.userName = 'Guest-' + Math.floor(Math.random() * 1000);
    }

    if (secureRoomId) {
      this.meetingService.localUserName = this.userName;
      this.router.navigate(['/meeting', secureRoomId]);
    }
  }
}

