import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Task } from '../../../../core/models/app.models';

@Component({
  selector: 'app-task-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './task-calendar.html',
  styleUrls: ['./task-calendar.scss']
})
export class TaskCalendar implements OnChanges {
  @Input({ required: true }) tasks: Task[] = [];
  @Output() taskClick = new EventEmitter<Task>();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    height: 'auto',
    displayEventTime: false,
    buttonText: { today: 'Today' },
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.renderEventContent.bind(this),
    events: [] // will be populated in ngOnChanges
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks'] && this.tasks) {
      this.updateEvents();
    }
  }

  updateEvents(): void {
    const calendarEvents = this.tasks
      .filter(task => !!task.deadline)
      .map(task => ({
        id: task.id,
        title: task.title,
        date: task.deadline!,
        extendedProps: { task }
      }));

    // Reassigning the object triggers Angular's change detection to update the UI
    this.calendarOptions = {
      ...this.calendarOptions,
      events: calendarEvents
    };
  }

  renderEventContent(info: EventContentArg) {
    const task = info.event.extendedProps['task'] as Task;
    
    // Determine status class
    let statusClass = 'status-pending';
    if (task.status === 'Done') statusClass = 'status-done';
    else if (task.status === 'InProgress') statusClass = 'status-progress';

    // The "Gotcha": Returning a raw HTML string instead of JSX
    return {
      html: `
        <div class="calendar-event-custom">
          <span class="event-dot ${statusClass}"></span>
          <span class="event-title">${info.event.title}</span>
        </div>
      `
    };
  }

  handleEventClick(info: EventClickArg): void {
    const task = info.event.extendedProps['task'] as Task;
    this.taskClick.emit(task);
  }
}