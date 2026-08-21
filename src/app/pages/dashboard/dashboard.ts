import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

const TOKEN_STORAGE_KEY = 'oauth_token_response';

const TOKEN_URL = 'http://localhost:5000/oauth/token';
const LOGOUT_URL = 'http://localhost:5000/logout';
const CLIENT_ID = 'client_sdlkfj234kdjf2l34';
const AUDIENCE = 'https://resource-server.com';
const POST_LOGOUT_REDIRECT_URI = 'http://localhost:4200/logout';

const MIN_REFRESH_SPINNER_MS = 1000;
const REFRESH_TIMEOUT_MS = 10000;

const BACKGROUND_COLORS = ['#f1f5f9', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#ede9fe'];

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
  imports: [DatePipe, CardModule, TableModule, TagModule, AvatarModule, PanelModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  tokenPayload: string | null = null;
  idToken: string | null = null;
  accessToken: string | null = null;
  refreshToken: string | null = null;

  isRefreshing = false;
  refreshError: string | null = null;
  backgroundColor = BACKGROUND_COLORS[0];

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.loadStoredTokens();
  }

  private loadStoredTokens(): void {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.tokenPayload = JSON.stringify(parsed, null, 2);
        this.idToken = parsed.id_token ?? null;
        this.accessToken = parsed.access_token ?? null;
        this.refreshToken = parsed.refresh_token ?? null;
      } catch {
        this.tokenPayload = raw;
      }
    }
  }

  async refreshTokens(): Promise<void> {
    if (!this.refreshToken || this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    this.refreshError = null;
    this.cdr.markForCheck();

    const startedAt = performance.now();
    console.log('[refreshTokens] sending POST', TOKEN_URL);

    const request = firstValueFrom(
      this.http
        .post(
          TOKEN_URL,
          {
            refresh_token: this.refreshToken,
            client_id: CLIENT_ID,
            grant_type: 'refresh_token',
            audience: AUDIENCE
          },
          { withCredentials: true }
        )
        .pipe(timeout(REFRESH_TIMEOUT_MS))
    );
    const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_REFRESH_SPINNER_MS));

    try {
      const [response] = await Promise.all([request, minDelay]);
      console.log(`[refreshTokens] resolved after ${Math.round(performance.now() - startedAt)}ms`, response);
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(response));
      this.loadStoredTokens();
    } catch (err) {
      console.error(`[refreshTokens] failed after ${Math.round(performance.now() - startedAt)}ms`, err);
      this.refreshError = 'Token refresh failed. See console for details.';
    } finally {
      this.isRefreshing = false;
      this.cycleBackgroundColor();
      this.cdr.markForCheck();
    }
  }

  private cycleBackgroundColor(): void {
    const choices = BACKGROUND_COLORS.filter((color) => color !== this.backgroundColor);
    this.backgroundColor = choices[Math.floor(Math.random() * choices.length)];
  }

  statusSeverity(status: ActivityRow['status']): 'success' | 'danger' | 'warn' {
    if (status === 'Success') return 'success';
    if (status === 'Failed') return 'danger';
    return 'warn';
  }

  logout(): void {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      post_logout_redirect_uri: POST_LOGOUT_REDIRECT_URI
    });

    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (raw) {
      try {
        const { id_token } = JSON.parse(raw);
        if (id_token) {
          params.set('id_token_hint', id_token);
        }
      } catch {
        // ignore malformed token response
      }
    }

    window.location.href = `${LOGOUT_URL}?${params.toString()}`;
  }

  backToHome(): void {
    this.router.navigate(['/']);
  }
}
