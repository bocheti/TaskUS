import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';
// import { OrganisationService } from '../../../core/services/organisation';
// import { UserService } from '../../../core/services/user';

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
    private router: Router
    // private orgService: OrganisationService,
    // private userService: UserService
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
    // TODO: Replace with actual this.orgService.getAllOrganisations().subscribe(...)
    console.log('Fetching organisations...');
    setTimeout(() => {
      this.organisations = [
        { id: '1', name: 'Acme Corporation' },
        { id: '2', name: 'Beta Industries' }
      ];
      this.isLoadingOrgs = false;
    }, 800);
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

    // TODO: Replace with actual this.userService.requestAccount(formValues).subscribe(...)
    console.log('Simulating account request with:', formValues);
    
    setTimeout(() => {
      alert('Account request sent! Please wait for admin approval.'); // TODO: Toast
      this.router.navigate(['/login']);
      this.isLoading = false;
    }, 1000);
  }
}