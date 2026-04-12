import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';

import { ProjectService } from '../../../../core/services/project';

@Component({
  selector: 'app-create-project-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './create-project-dialog.html',
  styleUrls: ['./create-project-dialog.scss']
})
export class CreateProjectDialog {
  @Input() isOpen = false;
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() projectCreated = new EventEmitter<void>();

  title = '';
  description = '';
  isSubmitting = false;

  constructor(private projectService: ProjectService) {}

  handleSubmit(): void {
    if (!this.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    this.isSubmitting = true;

    this.projectService.createProject({
      title: this.title.trim(),
      description: this.description.trim() || ''
    }).subscribe({
      next: () => {
        this.title = '';
        this.description = '';
        this.isSubmitting = false;
        this.projectCreated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating project:', error);
        const errorMessage = error.error?.error || 'Failed to create project';
        toast.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  handleCancel(): void {
    this.title = '';
    this.description = '';
    this.isOpenChange.emit(false);
  }
}