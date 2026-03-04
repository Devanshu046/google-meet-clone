import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-video-tile',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg w-full h-full min-h-[250px] aspect-video flex items-center justify-center">
      <!-- Media Element -->
      <video
        #videoElement
        class="absolute inset-0 w-full h-full object-cover"
        [muted]="isLocal"
        autoplay
        playsinline
      ></video>

      <!-- Overlay Name -->
      <div class="absolute bottom-4 left-4 bg-gray-900 bg-opacity-60 px-3 py-1 rounded-md text-white text-sm font-medium">
        {{ userName }} {{ isLocal ? '(You)' : '' }}
      </div>
      
      <!-- Video Off Placeholder -->
      <div *ngIf="!stream" class="absolute inset-0 flex items-center justify-center bg-gray-800 z-10 text-white font-bold text-xl">
        {{ userName.charAt(0).toUpperCase() }}
      </div>
    </div>
  `,
    styles: []
})
export class VideoTileComponent implements AfterViewInit, OnChanges {
    @Input() stream: MediaStream | null = null;
    @Input() userName: string = '';
    @Input() isLocal: boolean = false;

    @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;

    ngAfterViewInit(): void {
        this.updateVideoSrc();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['stream'] && !changes['stream'].firstChange) {
            this.updateVideoSrc();
        }
    }

    private updateVideoSrc(): void {
        if (this.videoRef && this.videoRef.nativeElement) {
            const videoEl = this.videoRef.nativeElement;
            if (this.stream) {
                // Only re-assigning if different to prevent flickering
                if (videoEl.srcObject !== this.stream) {
                    videoEl.srcObject = this.stream;
                }
            } else {
                videoEl.srcObject = null;
            }
        }
    }
}
