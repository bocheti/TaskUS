import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LandingBanner],
  templateUrl: './login-screen.html',
  styleUrls: ['./login-screen.scss']
})
export class LoginScreen implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Equivalent to your useEffect
    sessionStorage.removeItem('isLoggingOut');

    this.loginForm = this.fb.group({
      email: ['', [Validators.required]], // Relying on standard required for now
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        // TODO: Replace with Material Toast later
        console.log('Login successful with credentials:', credentials);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);},
      error: (err) => {
        const status = err.status;
        const message = err.error?.error;
        if (status === 401 || status === 403) {
          alert('Invalid email or password'); // TODO: Toast
        } else if (message) {
          alert(message); // TODO: Toast
        } else {
          alert('Login failed. Please try again.'); // TODO: Toast
        }
        
        this.isLoading = false;
      }
    });
  }
}