import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';
import { AuthService } from '../../../core/services/auth';
import { OrganisationService } from '../../../core/services/organisation';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs/operators';

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
    private router: Router,
    private orgService: OrganisationService,
    private cdr: ChangeDetectorRef
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
    const formValues = this.createOrgForm.value;

    if (formValues.password && formValues.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (formValues.password !== formValues.repeatPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (this.createOrgForm.invalid) {
      toast.error('Please fill out all required fields correctly.');
      return;
    }
    this.isLoading = true;

    const { orgName, firstName, lastName, email, password } = formValues;
    const apiPayload = {
      organisationName: orgName,
      firstName,
      lastName,
      email,
      password
    };

    this.orgService.createOrganisation(apiPayload)
    .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
    .subscribe({
      next: (response) => {
        this.authService.setAuthData(response.authToken, response.userInfo);
        toast.success(`Organisation created successfully! Welcome, ${formValues.firstName} ${formValues.lastName}!`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const status = err.status;
        const message = err.error?.error;
        
        if (status === 409) {
          toast.error('An account with this email already exists');
        } else if (message) {
          toast.error(message);
        } else {
          toast.error('Failed to create organisation. Please try again.');
        }
      }
    });
  }
}