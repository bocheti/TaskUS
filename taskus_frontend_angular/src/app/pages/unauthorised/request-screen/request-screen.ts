import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';
import { OrganisationService } from '../../../core/services/organisation';
import { UserService } from '../../../core/services/user';

@Component({
  selector: 'app-request-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LandingBanner],
  templateUrl: './request-screen.html',
  styleUrls: ['./request-screen.scss']
})
export class RequestScreen implements OnInit {
  requestForm!: FormGroup;
  isLoading = false;
  isLoadingOrgs = true;
  
  // Replace with actual OrganisationListItem type from your models
  organisations: any[] = []; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private orgService: OrganisationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.requestForm = this.fb.group({
      organisationId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeatPassword: ['', Validators.required]
    });

    this.fetchOrganisations();
  }

  fetchOrganisations(): void {
    this.orgService.getAllOrganisations().subscribe({
      next: (orgs) => {
        this.organisations = orgs;
        this.isLoadingOrgs = false;
      },
      error: () => {
        alert('Failed to load organisations');
        this.isLoadingOrgs = false;
      }
    });
  }

  onSubmit(): void {
    if (this.requestForm.invalid) return;

    const formValues = this.requestForm.value;

    if (formValues.password !== formValues.repeatPassword) {
      alert('Passwords do not match'); // TODO: Toast
      return;
    }

    if (formValues.password.length < 8) {
      alert('Password must be at least 8 characters'); // TODO: Toast
      return;
    }

    this.isLoading = true;

    this.userService.requestAccount(formValues).subscribe({
      next: () => {
        alert('Account request sent! Please wait for admin approval.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const status = err.status;
        const message = err.error?.error;

        if (status === 409) {
          alert('An account with this email already exists');
        } else if (message) {
          alert(message);
        } else {
          alert('Failed to request account. Please try again.');
        }
        this.isLoading = false;
      }
    });
  }
}