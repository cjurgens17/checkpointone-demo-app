import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

const AUTHORIZE_BASE_URL = 'http://localhost:5000/authorize';

const STATIC_PARAMS = {
  response_type: 'code',
  client_id: 'client_sdlkfj234kdjf2l34',
  redirect_uri: 'http://localhost:4200/callback',
  code_challenge_method: 'S256'
};

const CONNECTIONS = ['google-oauth2', 'Username-Password-Authentication', 'facebook', 'github'];

function randomOpaqueString(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function randomLetterString(length: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ButtonModule, CardModule, InputTextModule, SelectModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  connections = CONNECTIONS;

  scope = 'openid profile email';
  audience = 'https://resource-server.com';
  connection = 'google-oauth2';
  state = '';
  codeChallenge = '';

  private codeVerifier = '';

  constructor(private cdr: ChangeDetectorRef) {}

  get authorizeUrl(): string {
    const params: [string, string][] = [
      ['response_type', STATIC_PARAMS.response_type],
      ['client_id', STATIC_PARAMS.client_id],
      ['redirect_uri', STATIC_PARAMS.redirect_uri],
      ['scope', this.scope],
      ['state', this.state],
      ['connection', this.connection],
      ['code_challenge', this.codeChallenge],
      ['code_challenge_method', STATIC_PARAMS.code_challenge_method],
      ['audience', this.audience]
    ];
    return `${AUTHORIZE_BASE_URL}?${params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`;
  }

  generateState(): void {
    this.state = randomOpaqueString();
  }

  async generateCodeChallenge(): Promise<void> {
    const verifier = randomLetterString(10);
    this.codeVerifier = verifier;
    this.codeChallenge = await sha256Hex(verifier);
    this.cdr.markForCheck();
  }

  login(): void {
    if (this.state && this.codeVerifier) {
      localStorage.setItem(this.state, JSON.stringify({ code_verifier: this.codeVerifier, returnTo: '/dashboard' }));
    }
    window.location.href = this.authorizeUrl;
  }
}
