import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/join-room/join-room.component').then(m => m.JoinRoomComponent)
    },
    {
        path: 'meeting/:id',
        loadComponent: () => import('./components/meeting-room/meeting-room.component').then(m => m.MeetingRoomComponent)
    },
    { path: '**', redirectTo: '' }
];
