import { Component } from '@angular/core';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { ProjectList } from '../../../shared/components/project/project-list/project-list';

@Component({
  selector: 'app-project-list-screen',
  standalone: true,
  imports: [AuthorizedLayout, ProjectList],
  templateUrl: './project-list-screen.html',
  styleUrls: ['./project-list-screen.scss']
})
export class ProjectListScreen {}