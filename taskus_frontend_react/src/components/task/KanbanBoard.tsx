import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'Pending', title: 'Pending', color: 'bg-status-pending' },
  { id: 'InProgress', title: 'In Progress', color: 'bg-status-progress' },
  { id: 'Done', title: 'Done', color: 'bg-status-done' },
];

export const KanbanBoard = ({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;
    
    const newStatus = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    // Only update if status actually changed
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div className="mb-3 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <span className="text-sm text-muted-foreground">
                ({getTasksByStatus(column.id).length})
              </span>
            </div>

            {/* Droppable Column */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 rounded-lg border-2 p-3 space-y-3 min-h-[400px] transition-colors ${
                    snapshot.isDraggingOver
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background'
                  }`}
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg opacity-90' : ''
                          }`}
                        >
                          <TaskCard task={task} onClick={() => onTaskClick(task)} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Empty State */}
                  {getTasksByStatus(column.id).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No {column.title.toLowerCase()} tasks
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};