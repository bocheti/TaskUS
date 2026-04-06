import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';
import { OrganisationService } from '../../../core/services/organisation';
import { UserService } from '../../../core/services/user';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-request-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LandingBanner, MatIconModule],
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
    private userService: UserService,
    private cdr: ChangeDetectorRef
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
        this.cdr.detectChanges(); 
      },
      error: () => {
        toast.error('Failed to load organisations');
        this.isLoadingOrgs = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    const formValues = this.requestForm.value;

    if (formValues.password && formValues.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (formValues.password !== formValues.repeatPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (this.requestForm.invalid) {
      toast.error('Please fill out all required fields correctly.');
      return;
    }

    this.isLoading = true;

    this.userService.requestAccount(formValues)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          toast.success('Account request sent! Please wait for admin approval.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const status = err.status;
          const message = err.error?.error;
          if (status === 409) {
            toast.error('An account with this email already exists');
          } else if (message) {
            toast.error(message);
          } else {
            toast.error('Failed to request account. Please try again.');
          }
        }
      });
  }
}