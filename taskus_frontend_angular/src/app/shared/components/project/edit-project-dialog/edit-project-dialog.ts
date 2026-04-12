import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';

import { Project } from '../../../../core/models/app.models';
import { ProjectService } from '../../../../core/services/project';

@Component({
  selector: 'app-edit-project-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './edit-project-dialog.html',
  styleUrls: ['./edit-project-dialog.scss']
})
export class EditProjectDialog implements OnChanges {
  @Input() isOpen = false;
  @Input({ required: true }) project!: Project;
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() projectUpdated = new EventEmitter<Project>();

  title = '';
  description = '';
  isSubmitting = false;

  constructor(private projectService: ProjectService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && this.project) {
      this.title = this.project.title;
      this.description = this.project.description || '';
    }
  }

  handleSubmit(): void {
    if (!this.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    this.isSubmitting = true;

    this.projectService.updateProject(this.project.id, {
      newTitle: this.title.trim(),
      newDescription: this.description.trim() || ''
    }).subscribe({
      next: (updatedProject) => {
        toast.success('Project updated successfully!');
        this.isSubmitting = false;
        this.projectUpdated.emit(updatedProject);
        this.isOpenChange.emit(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating project:', error);
        const errorMessage = error.error?.error || 'Failed to update project';
        toast.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  handleCancel(): void {
    this.title = this.project.title;
    this.description = this.project.description || '';
    this.isOpenChange.emit(false);
  }
}