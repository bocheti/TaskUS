import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';
import { AuthService } from '../../../core/services/auth';
import { toast } from 'ngx-sonner';

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Equivalent to your useEffect
    sessionStorage.removeItem('isLoggingOut');

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      toast.error('Please enter a valid email and password.');
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          toast.success('Login successful! Welcome back.');
          this.router.navigate(['/dashboard']); 
        },
        error: (err) => {
          const status = err.status;
          const message = err.error?.error;
          
          if (status === 401 || status === 403) {
            toast.error('Invalid email or password');
          } else if (message) {
            toast.error(message);
          } else {
            toast.error('Login failed. Please try again.');
          }
        }
      });
  }
}