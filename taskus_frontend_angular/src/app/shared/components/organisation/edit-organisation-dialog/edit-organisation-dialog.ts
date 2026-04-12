import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';

import { Organisation } from '../../../../core/models/app.models';
import { OrganisationService } from '../../../../core/services/organisation';

@Component({
  selector: 'app-edit-organisation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './edit-organisation-dialog.html',
  styleUrls: ['./edit-organisation-dialog.scss']
})
export class EditOrganisationDialog implements OnChanges {
  @Input() isOpen = false;
  @Input({ required: true }) organisation!: Organisation;
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() organisationUpdated = new EventEmitter<Organisation>();

  name = '';
  description = '';
  isSubmitting = false;

  constructor(private organisationService: OrganisationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['organisation'] && this.organisation) {
      this.name = this.organisation.name;
      this.description = this.organisation.description || '';
    }
  }

  handleSubmit(): void {
    if (!this.name.trim()) {
      toast.error('Organisation name is required');
      return;
    }

    this.isSubmitting = true;

    this.organisationService.updateOrganisation({
      newName: this.name.trim(),
      newDescription: this.description.trim() || ''
    }).subscribe({
      next: () => {
        toast.success('Organisation updated successfully!');
        this.isSubmitting = false;
        
        // Optimistic UI update to satisfy strict typing
        const updatedOrg: Organisation = {
          ...this.organisation,
          name: this.name.trim(),
          description: this.description.trim() || ''
        };

        this.organisationUpdated.emit(updatedOrg);
        this.isOpenChange.emit(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating organisation:', error);
        const errorMessage = error.error?.error || 'Failed to update organisation';
        toast.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  handleCancel(): void {
    this.name = this.organisation.name;
    this.description = this.organisation.description || '';
    this.isOpenChange.emit(false);
  }
}