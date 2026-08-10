import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';

const TOKEN_STORAGE_KEY = 'oauth_token_response';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  change: string;
  changeType: 'up' | 'down';
}

interface ActivityRow {
  event: string;
  ip: string;
  device: string;
  status: 'Success' | 'Failed' | 'Pending';
  date: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, CardModule, TableModule, TagModule, AvatarModule, PanelModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  tokenPayload: string | null = null;

  stats: StatCard[] = [
    { label: 'Active Sessions', value: '128', icon: 'pi pi-users', change: '+12%', changeType: 'up' },
    { label: 'API Requests (24h)', value: '4,231', icon: 'pi pi-bolt', change: '+8%', changeType: 'up' },
    { label: 'Failed Logins', value: '3', icon: 'pi pi-shield', change: '-2%', changeType: 'down' },
    { label: 'Avg. Response Time', value: '182ms', icon: 'pi pi-clock', change: '+1%', changeType: 'up' }
  ];

  activity: ActivityRow[] = [
    { event: 'Login', ip: '192.168.1.24', device: 'Chrome / macOS', status: 'Success', date: new Date('2026-08-10T09:12:00') },
    { event: 'Token Refresh', ip: '192.168.1.24', device: 'Chrome / macOS', status: 'Success', date: new Date('2026-08-10T08:47:00') },
    { event: 'Login', ip: '10.0.0.5', device: 'Safari / iOS', status: 'Failed', date: new Date('2026-08-09T21:03:00') },
    { event: 'Password Reset', ip: '10.0.0.5', device: 'Safari / iOS', status: 'Pending', date: new Date('2026-08-09T20:58:00') },
    { event: 'Login', ip: '172.16.4.11', device: 'Firefox / Windows', status: 'Success', date: new Date('2026-08-08T14:22:00') }
  ];

  ngOnInit(): void {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (raw) {
      try {
        this.tokenPayload = JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        this.tokenPayload = raw;
      }
    }
  }

  statusSeverity(status: ActivityRow['status']): 'success' | 'danger' | 'warn' {
    if (status === 'Success') return 'success';
    if (status === 'Failed') return 'danger';
    return 'warn';
  }
}
