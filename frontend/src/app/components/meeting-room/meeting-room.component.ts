import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MeetingService } from '../../services/meeting.service';
import { VideoTileComponent } from '../video-tile/video-tile.component';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { ChatPanelComponent } from '../chat-panel/chat-panel.component';
import { Observable } from 'rxjs';
import { Participant } from '../../models/participant.model';

@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [CommonModule, VideoTileComponent, ControlBarComponent, ChatPanelComponent],
  template: `
    <div class="bg-[#202124] min-h-screen text-white flex flex-col font-sans relative overflow-hidden">
      <!-- Header -->
      <div class="p-4 flex justify-between items-center absolute top-0 w-full z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div class="flex items-center gap-2">
            <span class="text-xl font-semibold">Meet</span>
        </div>
        <!-- Right Side: Participant Count -->
        <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-900 bg-opacity-60 rounded-md text-sm font-medium">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
             </svg>
             <ng-container *ngIf="participants$ | async as participants">
                {{ participants.length }}
             </ng-container>
        </div>
      </div>

      <!-- Main Content Area: Video Grid + Sidebar -->
      <div class="flex-grow p-4 pb-24 mt-16 flex items-start justify-center w-full max-w-[1600px] mx-auto h-[calc(100vh-6rem)] overflow-hidden gap-4">
        
        <!-- Video Grid -->
        <ng-container *ngIf="participants$ | async as participants">
          <div class="flex-1 w-full h-full pb-4">
            <div class="grid w-full h-full gap-4 auto-rows-fr"
                 [ngClass]="{
                   'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': participants.length > 2 && !isChatOpen,
                   'grid-cols-1 md:grid-cols-2': participants.length === 2 || (participants.length > 2 && isChatOpen),
                   'grid-cols-1 md:max-w-4xl mx-auto': participants.length === 1
                 }">
              
              <app-video-tile
                *ngFor="let p of participants"
                [stream]="p.stream"
                [userName]="p.userName"
                [isLocal]="p.isLocal"
              ></app-video-tile>

            </div>
          </div>
        </ng-container>

        <!-- Chat Sidebar -->
        <div *ngIf="isChatOpen" class="w-[360px] h-full pb-4 hidden md:block shrink-0">
           <app-chat-panel class="block h-full"></app-chat-panel>
        </div>
        
      </div>

      <!-- Controls Overlay Footer -->
      <div class="absolute bottom-0 left-0 w-full z-50 pointer-events-none flex items-center">
          
          <!-- Bottom Left: Time and ID -->
          <div class="absolute left-6 bottom-6 pointer-events-auto text-white font-medium text-sm drop-shadow-md pb-1">
              {{ currentTime }} | {{ roomId }}
          </div>

          <!-- Bottom Center: Control Bar itself (Control Bar needs pointer-events-auto) -->
          <div class="w-full pointer-events-auto">
             <app-control-bar
                [isMicMuted]="isMicMuted"
                [isCamOff]="isCamOff"
                [isChatOpen]="isChatOpen"
                (micToggle)="onMicToggle()"
                (camToggle)="onCamToggle()"
                (chatToggle)="onChatToggle()"
                (leave)="onLeaveMeeting()"
              ></app-control-bar>
          </div>
      </div>
    </div>
  `,
  styles: []
})
export class MeetingRoomComponent implements OnInit, OnDestroy {
  roomId: string = '';
  userName: string = '';
  participants$: Observable<Participant[]>;

  isMicMuted: boolean = false;
  isCamOff: boolean = false;
  isChatOpen: boolean = false;

  currentTime: string = '';
  private timeInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public meetingService: MeetingService
  ) {
    this.participants$ = this.meetingService.participants$;
  }

  async ngOnInit(): Promise<void> {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';

    // Start clock
    this.updateTime();
    this.timeInterval = setInterval(() => this.updateTime(), 1000);

    // Quick check if userName is in service. If not, maybe user navigated directly.
    // E.g., via meeting URL support
    this.userName = this.meetingService.localUserName;

    if (!this.roomId) {
      this.router.navigate(['/']);
      return;
    }

    if (!this.userName) {
      // User arrived via deep link. Redirect to join page specifically for this room.
      this.router.navigate(['/'], { queryParams: { r: this.roomId } });
      return;
    }

    // Initialize meeting and join signaling server
    await this.meetingService.initializeMeeting(this.roomId, this.userName);
  }

  onMicToggle(): void {
    if (this.meetingService.localStream) {
      const audioTrack = this.meetingService.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMicMuted = !audioTrack.enabled;
      }
    }
  }

  onCamToggle(): void {
    if (this.meetingService.localStream) {
      const videoTrack = this.meetingService.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isCamOff = !videoTrack.enabled;
      }
    }
  }

  onChatToggle(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  onLeaveMeeting(): void {
    this.meetingService.leaveMeeting();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    // If component is destroyed and user is still in the room context, trigger cleanup via service
    this.meetingService.leaveMeeting();
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
