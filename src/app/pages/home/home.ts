import { Component } from '@angular/core';

const AUTHORIZE_URL =
  'http://localhost:5000/authorize?response_type=code&client_id=client_sdlkfj234kdjf2l34&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fcallback&scope=openid%20profile%20email&state=xyz123&connection=google-oauth2&code_challenge=2fb614632cfc24212e26cdd8df1ead826e19165d280efa035933771139c7b2ef&code_challenge_method=S256&audience=https://resource-server.com';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  login(): void {
    window.location.href = AUTHORIZE_URL;
  }
}
