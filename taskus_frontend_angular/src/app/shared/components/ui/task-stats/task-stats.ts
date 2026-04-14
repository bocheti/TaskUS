import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/models/app.models';

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-stats.html',
  styleUrls: ['./task-stats.scss']
})
export class TaskStats implements OnChanges {
  @Input({ required: true }) tasks: Task[] = [];
  @Input() title = 'Statistics';

  completedTasks: Task[] = [];
  activeTasks: Task[] = [];
  totalTasks = 0;
  completionRate = 0;
  avgCompletionTime = 0;
  recentCompletedTasks: Task[] = [];

  timeFilter: 7 | 30 | 90 = 30;

  pendingCount = 0;
  inProgressCount = 0;
  doneCount = 0;
  pieMetrics = {
    pendingArray: '0 439.82', pendingOffset: 0,
    progressArray: '0 439.82', progressOffset: 0,
    doneArray: '0 439.82', doneOffset: 0,
  };

  hoveredSlice: 'pending' | 'progress' | 'done' | null = null;
  activePointIndex = 0;
  isHoveringLine = false;
  hoveredBar: number | null = null;

  maxLineCount = 1;
  midLineCount = 0;

  linePoints: { x: number; y: number; nextX: number | null; nextY: number | null; date: string; count: number; bandWidth: number }[] = [];
  barPoints: { x: number; y: number; height: number; value: number; label: string }[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks'] && this.tasks) {
      this.updateDerivedState();
    }
  }

  get activeLinePoint() {
    const safeIndex = Math.min(this.activePointIndex, this.linePoints.length - 1);
    return this.linePoints[safeIndex];
  }

  updateDerivedState(): void {
    this.completedTasks = this.tasks.filter(t => t.status === 'Done');
    this.activeTasks = this.tasks.filter(t => t.status !== 'Done');
    this.totalTasks = this.tasks.length;
    
    this.completionRate = this.totalTasks > 0 
      ? Math.round((this.completedTasks.length / this.totalTasks) * 100) 
      : 0;

    const completionTimes = this.completedTasks
      .filter(t => t.completedAt && t.createdAt)
      .map(t => {
        const created = new Date(t.createdAt).getTime();
        const completed = new Date(t.completedAt!).getTime();
        return Math.abs(completed - created) / (1000 * 60 * 60 * 24); // Safe absolute value
      });
      
    this.avgCompletionTime = completionTimes.length > 0
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;

    this.pendingCount = this.tasks.filter(t => t.status === 'Pending').length;
    this.inProgressCount = this.tasks.filter(t => t.status === 'InProgress').length;
    this.doneCount = this.completedTasks.length;

    this.calculatePieChart();
    this.calculateTimeFilteredData();
  }

  onTimeFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.timeFilter = Number(target.value) as 7 | 30 | 90;
    this.calculateTimeFilteredData();
    this.cdr.detectChanges();
  }

  calculateTimeFilteredData(): void {
    const now = new Date();
    const filterDate = new Date(now.getTime() - this.timeFilter * 24 * 60 * 60 * 1000);
    
    this.recentCompletedTasks = this.completedTasks.filter(t => 
      t.completedAt && new Date(t.completedAt) >= filterDate
    );

    // Line Chart: Group by day
    const tasksByDay = Array.from({ length: this.timeFilter }, (_, i) => {
      const date = new Date(now.getTime() - (this.timeFilter - 1 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = this.recentCompletedTasks.filter(t => {
        const completedDate = new Date(t.completedAt!).toISOString().split('T')[0];
        return completedDate === dateStr;
      }).length;
      return { date: dateStr, count };
    });

    this.maxLineCount = Math.max(...tasksByDay.map(d => d.count), 1);
    this.midLineCount = Math.round(this.maxLineCount / 2);

    this.linePoints = tasksByDay.map((day, i) => {
      const bandWidth = tasksByDay.length > 1 ? 340 / (tasksByDay.length - 1) : 340;
      const x = 40 + (i / (tasksByDay.length - 1)) * 340;
      const y = 130 - (day.count / this.maxLineCount) * 110;
      
      const nextDay = tasksByDay[i + 1];
      const nextX = nextDay ? 40 + ((i + 1) / (tasksByDay.length - 1)) * 340 : null;
      const nextY = nextDay ? 130 - (nextDay.count / this.maxLineCount) * 110 : null;
      
      return { x, y, nextX, nextY, date: day.date, count: day.count, bandWidth };
    });

    // Bar Chart: Group by month
    const tasksByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const count = this.completedTasks.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate.getFullYear() === date.getFullYear() && 
               completedDate.getMonth() === date.getMonth();
      }).length;
      return { month: monthStr, count };
    });

    const maxBarCount = Math.max(...tasksByMonth.map(m => m.count), 1);
    
    this.barPoints = tasksByMonth.map((month, i) => {
      const height = maxBarCount > 0 ? (month.count / maxBarCount) * 160 : 0;
      return {
        x: i * 100 + 20,
        y: 180 - height,
        height,
        value: month.count,
        label: month.month.split(' ')[0]
      };
    });
  }

  calculatePieChart(): void {
    if (this.totalTasks === 0) return;
    const circumference = 439.82;
    
    this.pieMetrics = {
      pendingArray: `${(this.pendingCount / this.totalTasks) * circumference} ${circumference}`,
      pendingOffset: 0,
      
      progressArray: `${(this.inProgressCount / this.totalTasks) * circumference} ${circumference}`,
      progressOffset: -((this.pendingCount / this.totalTasks) * circumference),
      
      doneArray: `${(this.doneCount / this.totalTasks) * circumference} ${circumference}`,
      doneOffset: -(((this.pendingCount + this.inProgressCount) / this.totalTasks) * circumference)
    };
  }

  setHoveredSlice(slice: 'pending' | 'progress' | 'done' | null): void {
    this.hoveredSlice = slice;
  }

  setHoveredBar(index: number | null): void {
    this.hoveredBar = index;
  }

  setHoveringLine(isHovering: boolean, pointIndex?: number): void {
    this.isHoveringLine = isHovering;
    if (pointIndex !== undefined) {
      this.activePointIndex = pointIndex;
    }
  }
}