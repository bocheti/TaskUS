import { useState } from "react";
import { Task } from "@/types";

interface TaskStatsProps {
  tasks: Task[];
  title: string;
}

export const TaskStats = ({ tasks, title }: TaskStatsProps) => {
  const [timeFilter, setTimeFilter] = useState<7 | 30 | 90>(30);

  // Calculate stats
  const completedTasks = tasks.filter(t => t.status === "Done");
  const activeTasks = tasks.filter(t => t.status !== "Done");
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Average completion time
  const completionTimes = completedTasks
    .filter(t => t.completedAt)
    .map(t => {
      const created = new Date(t.createdAt).getTime();
      const completed = new Date(t.completedAt!).getTime();
      return (completed - created) / (1000 * 60 * 60 * 24); // days
    });
  const avgCompletionTime = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
    : 0;

  // Filter tasks by time period
  const now = new Date();
  const filterDate = new Date(now.getTime() - timeFilter * 24 * 60 * 60 * 1000);
  const recentCompletedTasks = completedTasks.filter(t => 
    t.completedAt && new Date(t.completedAt) >= filterDate
  );

  // Group by day for line chart
  const tasksByDay = Array.from({ length: timeFilter }, (_, i) => {
    const date = new Date(now.getTime() - (timeFilter - 1 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const count = recentCompletedTasks.filter(t => {
      const completedDate = new Date(t.completedAt!).toISOString().split('T')[0];
      return completedDate === dateStr;
    }).length;
    return { date: dateStr, count };
  });

  // Group by month for bar chart
  const tasksByMonth = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const count = completedTasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate.getFullYear() === date.getFullYear() && 
             completedDate.getMonth() === date.getMonth();
    }).length;
    return { month: monthStr, count };
  });

  // Pie chart data
  const pendingCount = tasks.filter(t => t.status === "Pending").length;
  const inProgressCount = tasks.filter(t => t.status === "InProgress").length;
  const doneCount = tasks.filter(t => t.status === "Done").length;

  return (
    <div className="space-y-4">
      <h3 className="text-2xl mb-6 font-bold">{title}</h3>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background rounded-lg border-2 border-border p-4 text-center">
          <div className="text-3xl font-bold text-status-done">{completedTasks.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Tasks Completed</div>
        </div>
        <div className="bg-background rounded-lg border-2 border-border p-4 text-center">
          <div className="text-3xl font-bold text-primary">{activeTasks.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Active Tasks</div>
        </div>
        <div className="bg-background rounded-lg border-2 border-border p-4 text-center">
          <div className="text-3xl font-bold text-foreground">{completionRate}%</div>
          <div className="text-sm text-muted-foreground mt-1">Completion Rate</div>
        </div>
        <div className="bg-background rounded-lg border-2 border-border p-4 text-center">
          <div className="text-3xl font-bold text-foreground">{avgCompletionTime}</div>
          <div className="text-sm text-muted-foreground mt-1">Avg Days to Complete</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task Distribution Pie Chart */}
        <div className="bg-background rounded-lg border-2 border-border p-6 flex flex-col">
          <h4 className="text-lg font-semibold mb-4">Task Distribution</h4>
          {totalTasks > 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <svg viewBox="0 0 200 200" className="w-full h-full max-h-[200px] max-w-[200px]">
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="hsl(var(--status-pending))"
                  strokeWidth="40"
                  strokeDasharray={`${(pendingCount / totalTasks) * 439.82} 439.82`}
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="hsl(var(--status-progress))"
                  strokeWidth="40"
                  strokeDasharray={`${(inProgressCount / totalTasks) * 439.82} 439.82`}
                  strokeDashoffset={-((pendingCount / totalTasks) * 439.82)}
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="hsl(var(--status-done))"
                  strokeWidth="40"
                  strokeDasharray={`${(doneCount / totalTasks) * 439.82} 439.82`}
                  strokeDashoffset={-(((pendingCount + inProgressCount) / totalTasks) * 439.82)}
                  transform="rotate(-90 100 100)"
                />
              </svg>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">No tasks yet</p>
            </div>
          )}
          <div className="flex justify-center gap-4 mt-4 text-muted-foreground text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-status-pending" />
              <span>Pending ({pendingCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-status-progress" />
              <span>In Progress ({inProgressCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-status-done" />
              <span>Done ({doneCount})</span>
            </div>
          </div>
        </div>

        {/* Completion Over Time Line Chart */}
        <div className="bg-background rounded-lg border-2 border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Completion Timeline</h4>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(Number(e.target.value) as 7 | 30 | 90)}
              className="text-sm border border-input rounded px-2 py-1 bg-background"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          {recentCompletedTasks.length > 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <svg viewBox="0 0 400 150" className="w-full h-full max-h-[200px]">
                {tasksByDay.map((day, i) => {
                  const x = (i / (tasksByDay.length - 1)) * 380 + 10;
                  const maxCount = Math.max(...tasksByDay.map(d => d.count), 1);
                  const y = 140 - (day.count / maxCount) * 120;
                  const nextDay = tasksByDay[i + 1];
                  const nextX = nextDay ? ((i + 1) / (tasksByDay.length - 1)) * 380 + 10 : x;
                  const nextY = nextDay ? 140 - (nextDay.count / maxCount) * 120 : y;
                  
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="3" fill="hsl(var(--primary))" />
                      {nextDay && (
                        <line
                          x1={x}
                          y1={y}
                          x2={nextX}
                          y2={nextY}
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  );
                })}
                <line x1="10" y1="140" x2="390" y2="140" stroke="hsl(var(--border))" strokeWidth="1" />
              </svg>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">No completed tasks in this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Performance Bar Chart */}
      <div className="bg-background rounded-lg border-2 border-border p-6 md:col-span-2 flex flex-col">
        <h4 className="text-lg font-semibold mb-4">Monthly Performance</h4>
        {completedTasks.length > 0 ? (
          <div className="h-[200px] w-full flex items-center justify-center">
            <svg viewBox="0 0 600 200" className="w-full h-full">
              {tasksByMonth.map((month, i) => {
                const maxCount = Math.max(...tasksByMonth.map(m => m.count), 1);
                const barHeight = (month.count / maxCount) * 160;
                const x = i * 100 + 20;
                const y = 180 - barHeight;
                
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width="60"
                      height={barHeight}
                      fill="hsl(var(--primary))"
                      rx="4"
                    />
                    <text
                      x={x + 30}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-xs fill-foreground font-semibold"
                    >
                      {month.count}
                    </text>
                    <text
                      x={x + 30}
                      y="195"
                      textAnchor="middle"
                      className="text-xs fill-muted-foreground"
                    >
                      {month.month.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
              <line x1="10" y1="180" x2="590" y2="180" stroke="hsl(var(--border))" strokeWidth="1" />
            </svg>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">No completed tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
};