import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';
import { UserService } from '../../../core/services/user';

@Component({
  selector: 'app-reset-password-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LandingBanner],
  templateUrl: './reset-password-screen.html',
  styleUrls: ['./reset-password-screen.scss']
})
export class ResetPasswordScreen implements OnInit {
  resetForm!: FormGroup;
  isLoading = false;
  token = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Extract the ?token= value from the URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      repeatPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    if (!this.token) {
      alert('Invalid or missing reset token'); // TODO: Toast
      return;
    }

    const { newPassword, repeatPassword } = this.resetForm.value;

    if (newPassword !== repeatPassword) {
      alert('Passwords do not match'); // TODO: Toast
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters'); // TODO: Toast
      return;
    }

    this.isLoading = true;

    this.userService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        alert('Password reset successful! You can now log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const message = err.error?.error;
        if (message) {
          alert(message);
        } else {
          alert('Failed to reset password. The link may have expired.');
        }
        this.isLoading = false;
      }
    });
  }
}