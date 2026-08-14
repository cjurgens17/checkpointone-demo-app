import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.css'
})
export class Logout implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
