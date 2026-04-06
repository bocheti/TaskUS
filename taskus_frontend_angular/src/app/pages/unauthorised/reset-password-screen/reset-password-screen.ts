import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';
import { UserService } from '../../../core/services/user';
import { toast } from 'ngx-sonner';

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
      toast.error('Invalid or missing reset token');
      return;
    }

    const { newPassword, repeatPassword } = this.resetForm.value;

      if (newPassword !== repeatPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    this.isLoading = true;

    this.userService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        toast.success('Password reset successful! You can now log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const message = err.error?.error;
        if (message) {
          toast.error(message);
        } else {
          toast.error('Failed to reset password. The link may have expired.');
        }
        this.isLoading = false;
      }
    });
  }
}