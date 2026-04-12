import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';

import { Organisation } from '../../../core/models/app.models';
import { OrganisationService } from '../../../core/services/organisation';

import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { ProjectList } from '../../../shared/components/project/project-list/project-list';
import { EditOrganisationDialog } from '../../../shared/components/organisation/edit-organisation-dialog/edit-organisation-dialog';

@Component({
  selector: 'app-organisation-settings-screen',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    AuthorizedLayout,
    ProjectList,
    EditOrganisationDialog
  ],
  templateUrl: './organisation-settings-screen.html',
  styleUrls: ['./organisation-settings-screen.scss']
})
export class OrganisationSettingsScreen implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  organisation: Organisation | null = null;
  isLoading = true;
  isUploading = false;
  editDialogOpen = false;

  constructor(
    private organisationService: OrganisationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchOrganisation();
  }

  fetchOrganisation(): void {
    this.isLoading = true;
    this.organisationService.getOrganisation().subscribe({
      next: (orgData) => {
        this.organisation = orgData;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        toast.error('Failed to load organisation');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    this.isUploading = true;
    this.organisationService.uploadPic(file).subscribe({
      next: () => {
        toast.success('Organisation picture updated!');
        this.fetchOrganisation(); // Re-fetch to get the new image URL
        this.isUploading = false;
        
        if (this.fileInputRef && this.fileInputRef.nativeElement) {
          this.fileInputRef.nativeElement.value = '';
        }
      },
      error: (error) => {
        console.error('Error uploading picture:', error);
        toast.error('Failed to upload picture');
        this.isUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleOrganisationUpdated(updatedOrg: Organisation): void {
    this.organisation = updatedOrg;
    this.cdr.detectChanges();
  }
}