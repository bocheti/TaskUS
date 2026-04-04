import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';
import { AuthService } from '../../../core/services/auth';
// Assuming you create this service next to match your React organisationService:
// import { OrganisationService } from '../../../core/services/organisation';

@Component({
  selector: 'app-create-org-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LandingBanner],
  templateUrl: './create-org-screen.html',
  styleUrls: ['./create-org-screen.scss']
})
export class CreateOrgScreen implements OnInit {
  createOrgForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
    // private orgService: OrganisationService
  ) {}

  ngOnInit(): void {
    this.createOrgForm = this.fb.group({
      orgName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeatPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.createOrgForm.invalid) return;

    const formValues = this.createOrgForm.value;

    if (formValues.password !== formValues.repeatPassword) {
      alert('Passwords do not match'); // TODO: Replace with Toast
      return;
    }

    if (formValues.password.length < 8) {
      alert('Password must be at least 8 characters'); // TODO: Replace with Toast
      return;
    }

    this.isLoading = true;

    // TODO: Replace with actual orgService.createOrganisation call
    // For now, simulating the API request
    console.log('Simulating API call with:', formValues);
    
    setTimeout(() => {
      // Simulated success block (Replace this block with your actual subscribe)
      /* this.orgService.createOrganisation(formValues).subscribe({
        next: (response) => {
          this.authService.setAuthData(response.authToken, response.userInfo);
          alert(`Organisation created successfully! Welcome, ${formValues.firstName} ${formValues.lastName}!`);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          const status = err.status;
          const message = err.error?.error;
          if (status === 409) {
            alert('An account with this email already exists');
          } else if (message) {
            alert(message);
          } else {
            alert('Failed to create organisation. Please try again.');
          }
          this.isLoading = false;
        }
      });
      */

      // Mock success behavior so you can test navigation right now:
      alert(`Organisation created successfully! Welcome, ${formValues.firstName} ${formValues.lastName}!`);
      this.router.navigate(['/dashboard']);
      this.isLoading = false;
    }, 1000);
  }
}