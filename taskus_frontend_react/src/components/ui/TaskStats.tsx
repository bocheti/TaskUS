import { useState } from "react";
import { Task } from "@/types";

interface TaskStatsProps {
  tasks: Task[];
  title: string;
}

export const TaskStats = ({ tasks, title }: TaskStatsProps) => {
  const [timeFilter, setTimeFilter] = useState<7 | 30 | 90>(30);
  const [hoveredPoint, setHoveredPoint] = useState<{date: string, count: number, x: number, y: number} | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<'pending' | 'progress' | 'done' | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Calculate stats
  const completedTasks = tasks.filter(t => t.status === "Done");
  const activeTasks = tasks.filter(t => t.status !== "Done");
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Average completion time
  const completionTimes = completedTasks
    .filter(t => t.completedAt && t.createdAt)
    .map(t => {
      const created = new Date(t.createdAt).getTime();
      const completed = new Date(t.completedAt!).getTime();
      return Math.abs(completed - created) / (1000 * 60 * 60 * 24); // days
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

  const maxLineCount = Math.max(...tasksByDay.map(d => d.count), 1);
  const midLineCount = Math.round(maxLineCount / 2);
  const maxBarCount = Math.max(...Array.from({ length: 6 }).map((_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return completedTasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate.getFullYear() === date.getFullYear() && completedDate.getMonth() === date.getMonth();
    }).length;
  }), 1);

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
                  cx="100" cy="100" r="70" 
                  fill="none" pointerEvents="stroke"
                  stroke="hsl(var(--status-pending))" 
                  strokeWidth={hoveredSlice === 'pending' ? 50 : 40}
                  strokeDasharray={`${(pendingCount / totalTasks) * 439.82} 439.82`} 
                  transform="rotate(-90 100 100)" 
                  className="transition-all duration-300 ease-out cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('pending')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                <circle 
                  cx="100" cy="100" r="70" 
                  fill="none" pointerEvents="stroke"
                  stroke="hsl(var(--status-progress))" 
                  strokeWidth={hoveredSlice === 'progress' ? 50 : 40}
                  strokeDasharray={`${(inProgressCount / totalTasks) * 439.82} 439.82`} 
                  strokeDashoffset={-((pendingCount / totalTasks) * 439.82)} 
                  transform="rotate(-90 100 100)" 
                  className="transition-all duration-300 ease-out cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('progress')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                <circle 
                  cx="100" cy="100" r="70" 
                  fill="none" pointerEvents="stroke"
                  stroke="hsl(var(--status-done))" 
                  strokeWidth={hoveredSlice === 'done' ? 50 : 40}
                  strokeDasharray={`${(doneCount / totalTasks) * 439.82} 439.82`} 
                  strokeDashoffset={-(((pendingCount + inProgressCount) / totalTasks) * 439.82)} 
                  transform="rotate(-90 100 100)" 
                  className="transition-all duration-300 ease-out cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('done')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              </svg>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">No tasks yet</p>
            </div>
          )}
          
          <div className="flex justify-center gap-4 mt-4 text-xs md:text-sm">
            <div 
              className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${hoveredSlice === 'pending' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
              onMouseEnter={() => setHoveredSlice('pending')}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div className="w-3 h-3 rounded-full bg-status-pending transition-transform duration-200" style={{ transform: hoveredSlice === 'pending' ? 'scale(1.2)' : 'scale(1)' }} />
              <span>Pending ({pendingCount})</span>
            </div>
            <div 
              className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${hoveredSlice === 'progress' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
              onMouseEnter={() => setHoveredSlice('progress')}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div className="w-3 h-3 rounded-full bg-status-progress transition-transform duration-200" style={{ transform: hoveredSlice === 'progress' ? 'scale(1.2)' : 'scale(1)' }} />
              <span>In Progress ({inProgressCount})</span>
            </div>
            <div 
              className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${hoveredSlice === 'done' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
              onMouseEnter={() => setHoveredSlice('done')}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div className="w-3 h-3 rounded-full bg-status-done transition-transform duration-200" style={{ transform: hoveredSlice === 'done' ? 'scale(1.2)' : 'scale(1)' }} />
              <span>Done ({doneCount})</span>
            </div>
          </div>
        </div>

        {/* Completion Over Time Line Chart */}
        <div className="bg-background rounded-lg border-2 border-border p-6 flex flex-col relative">
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
              <svg viewBox="0 0 400 160" className="w-full h-full max-h-[200px] overflow-visible">
                
                {/* Y-Axis & Horizontal Gridlines */}
                <text x="30" y="24" textAnchor="end" fill="hsl(var(--muted-foreground))" className="text-[10px]">{maxLineCount}</text>
                <line x1="40" y1="20" x2="380" y2="20" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
                {midLineCount > 0 && midLineCount < maxLineCount && (
                  <>
                    <text x="30" y="79" textAnchor="end" fill="hsl(var(--muted-foreground))" className="text-[10px]">{midLineCount}</text>
                    <line x1="40" y1="75" x2="380" y2="75" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
                  </>
                )}
                <text x="30" y="134" textAnchor="end" fill="hsl(var(--muted-foreground))" className="text-[10px]">0</text>
                <line x1="40" y1="130" x2="380" y2="130" stroke="hsl(var(--border))" strokeWidth="1" />

                {/* X-Axis Labels */}
                <text x="40" y="150" textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-[10px]">
                  {new Date(tasksByDay[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
                <text x="380" y="150" textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-[10px]">
                  Today
                </text>

                {/* Connecting lines */}
                {tasksByDay.map((day, i) => {
                  if (i === tasksByDay.length - 1) return null;
                  const x = 40 + (i / (tasksByDay.length - 1)) * 340;
                  const y = 130 - (day.count / maxLineCount) * 110;
                  const nextDay = tasksByDay[i + 1];
                  const nextX = 40 + ((i + 1) / (tasksByDay.length - 1)) * 340;
                  const nextY = 130 - (nextDay.count / maxLineCount) * 110;
                  
                  return (
                    <line key={`line-${i}`} x1={x} y1={y} x2={nextX} y2={nextY} stroke="hsl(var(--primary))" strokeWidth="2" />
                  );
                })}

                {/* Dots and hover zones */}
                {tasksByDay.map((day, i) => {
                  const x = 40 + (i / (tasksByDay.length - 1)) * 340;
                  const y = 130 - (day.count / maxLineCount) * 110;
                  
                  return (
                    <g key={`dot-${i}`}>
                      <circle cx={x} cy={y} r="3" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
                      <circle 
                        cx={x} cy={y} r="12" fill="transparent" className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint({ date: day.date, count: day.count, x, y })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}

                {hoveredPoint && (
                  <g className="pointer-events-none transition-opacity duration-150">
                    <rect 
                      x={hoveredPoint.x - 40} 
                      y={hoveredPoint.y < 60 ? hoveredPoint.y + 15 : hoveredPoint.y - 45} 
                      width="80" 
                      height="34" 
                      fill="white"
                      stroke="hsl(var(--border))"
                      rx="4" 
                      className="shadow-sm"
                    />
                    <text 
                      x={hoveredPoint.x} 
                      y={hoveredPoint.y < 60 ? hoveredPoint.y + 30 : hoveredPoint.y - 30} 
                      textAnchor="middle" 
                      fill="hsl(var(--foreground))"
                      className="text-[10px] font-bold"
                    >
                      {hoveredPoint.count} task{hoveredPoint.count !== 1 ? 's' : ''}
                    </text>
                    <text 
                      x={hoveredPoint.x} 
                      y={hoveredPoint.y < 60 ? hoveredPoint.y + 42 : hoveredPoint.y - 18} 
                      textAnchor="middle" 
                      fill="hsl(var(--muted-foreground))"
                      className="text-[9px]"
                    >
                      {new Date(hoveredPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </text>
                  </g>
                )}
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
                const barHeight = (month.count / maxBarCount) * 160;
                const x = i * 100 + 20;
                const y = 180 - barHeight;
                
                return (
                  <g 
                    key={i}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x={x}
                      y={y}
                      width="60"
                      height={barHeight}
                      fill="hsl(var(--primary))"
                      rx="4"
                    />
                    <rect
                      x={x}
                      y={y}
                      width="60"
                      height={barHeight}
                      fill="black"
                      fillOpacity={hoveredBar === i ? 0.15 : 0}
                      rx="4"
                      className="transition-opacity duration-200"
                    />
                    <text
                      x={x + 30}
                      y={y - 5}
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                      className="text-xs font-semibold transition-transform duration-300 ease-out"
                      style={{ transform: hoveredBar === i ? 'translateY(-4px)' : 'translateY(0)' }}
                    >
                      {month.count}
                    </text>
                    <text
                      x={x + 30}
                      y="195"
                      textAnchor="middle"
                      fill={hoveredBar === i ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                      className={`text-xs transition-colors duration-200 ${hoveredBar === i ? 'font-bold' : 'font-semibold'}`}
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