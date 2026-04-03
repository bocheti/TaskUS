import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import { Task } from "@/types";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskCalendar = ({ tasks, onTaskClick }: TaskCalendarProps) => {
  const events = tasks
    .filter((task): task is Task & { deadline: string } => !!task.deadline)
    .map((task) => ({
      id: task.id,
      title: task.title,
      date: task.deadline,
      extendedProps: { task },
    }));

  const renderEventContent = ({ event }: EventContentArg) => {
    const task = event.extendedProps.task as Task;
    const statusColor =
      task.status === "Done"
        ? "bg-status-done"
        : task.status === "InProgress"
        ? "bg-status-progress"
        : "bg-status-pending";
    return (
      <div className="flex items-center gap-1 text-[10px] w-full overflow-hidden">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor}`} />
        <span className="truncate w-full">{event.title}</span>
      </div>
    );
  };

  const handleEventClick = (info: EventClickArg) => {
    const task = info.event.extendedProps.task as Task;
    onTaskClick(task);
  };

  return (
    <div className="bg-background rounded-lg border-2 border-border p-4">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        displayEventTime={false}
        buttonText={{ today: "Today" }}
        eventClick={handleEventClick}
        eventClassNames="cursor-pointer text-[10px] px-1 py-0.5"
        eventContent={renderEventContent}
      />
    </div>
  );
};