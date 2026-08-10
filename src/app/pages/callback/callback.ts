import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

const TOKEN_URL = 'http://localhost:5000/oauth/token';
const TOKEN_STORAGE_KEY = 'oauth_token_response';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [],
  templateUrl: './callback.html',
  styleUrl: './callback.css'
})
export class Callback implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');
    const state = params.get('state');

    // state is intentionally not validated — demo app, see CLAUDE.md
    console.log('Received callback with state:', state);

    this.http.post(TOKEN_URL, { code }).subscribe({
      next: (response) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(response));
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Token exchange failed:', err);
      }
    });
  }
}
