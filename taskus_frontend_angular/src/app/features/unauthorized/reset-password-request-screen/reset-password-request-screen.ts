import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';

// import { UserService } from '../../../core/services/user';

@Component({
  selector: 'app-reset-password-request-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LandingBanner],
  templateUrl: './reset-password-request-screen.html',
  styleUrls: ['./reset-password-request-screen.scss']
})
export class ResetPasswordRequestScreen implements OnInit {
  resetForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
    // private userService: UserService
  ) {}

  ngOnInit(): void {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const { email } = this.resetForm.value;

    // TODO: Replace with actual this.userService.requestPasswordReset(email).subscribe(...)
    console.log(`Requesting password reset for: ${email}`);
    
    setTimeout(() => {
      alert('Password reset email sent! Check your inbox.'); // TODO: Replace with Toast
      this.router.navigate(['/login']);
      this.isLoading = false;
    }, 1000);
  }
}