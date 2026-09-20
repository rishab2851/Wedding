import React, { useState, useMemo } from 'react';
import {
  Task,
  TaskStatus,
  WeddingEvent,
  WEDDING_EVENTS,
  FamilyMember,
  WeddingSettings,
} from '../types';
import { HeroCountdownCard } from './HeroCountdownCard';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  Calendar,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle,
  ArrowRight,
  ListTodo,
  Columns3,
  Users,
  Building2,
  Car,
  Trash2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskManagerProps {
  settings: WeddingSettings;
  tasks: Task[];
  familyMembers: FamilyMember[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenSettings: () => void;
  onNavigateToGuests?: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  settings,
  tasks,
  familyMembers,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onOpenSettings,
  onNavigateToGuests,
}) => {
  // View By toggle: 'Overall' (Kanban) or 'Person'
  const [viewBy, setViewBy] = useState<'Overall' | 'Person'>('Overall');
  const [selectedPerson, setSelectedPerson] = useState<string>(
    familyMembers[0]?.name || 'Karan Chordia'
  );

  // Add Task Form Modal / Toggle
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newEvent, setNewEvent] = useState<WeddingEvent | 'General / Pre-Wedding'>('Sangeet');
  const [newAssignedTo, setNewAssignedTo] = useState(
    familyMembers[0]?.name || 'Rajesh Chordia'
  );
  const [newDeadline, setNewDeadline] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Person view accordions
  const [openPersonStatuses, setOpenPersonStatuses] = useState<Record<string, boolean>>({
    'Pending': true,
    'In Progress': true,
    'Done': false,
  });

  // Today reference for overdue checks
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const isTaskOverdue = (task: Task): boolean => {
    if (task.status === 'Done') return false;
    if (!task.deadline) return false;
    return task.deadline < todayStr;
  };

  // Stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'Done').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Upcoming Tasks: next 3 tasks sorted by nearest deadline (only showing tasks that exist and aren't Done)
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'Done' && t.deadline)
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 3);
  }, [tasks]);

  // Handle task status change with confetti if completed
  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    onUpdateTaskStatus(taskId, status);
    if (status === 'Done') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#C5A059', '#B2503A', '#8C6221', '#E8B4B8'],
        });
      } catch (err) {
        // ignore if not supported
      }
    }
  };

  // Add Task submit
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !newDeadline) return;

    onAddTask({
      name: newTaskName.trim(),
      event: newEvent,
      assignedTo: newAssignedTo,
      deadline: newDeadline,
      notes: newNotes.trim() || undefined,
      status: 'Pending',
    });

    setNewTaskName('');
    setNewNotes('');
    setIsAddingTask(false);
  };

  // Tasks filtered by person
  const personTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.assignedTo.toLowerCase() === selectedPerson.toLowerCase()
    );
  }, [tasks, selectedPerson]);

  const personTasksByStatus = useMemo(() => {
    return {
      Pending: personTasks.filter((t) => t.status === 'Pending'),
      'In Progress': personTasks.filter((t) => t.status === 'In Progress'),
      Done: personTasks.filter((t) => t.status === 'Done'),
    };
  }, [personTasks]);

  const toggleStatusAccordion = (st: string) => {
    setOpenPersonStatuses((prev) => ({
      ...prev,
      [st]: !prev[st],
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Countdown Card at top */}
      <HeroCountdownCard settings={settings} onOpenSettings={onOpenSettings} />

      {/* Guest Logistics Banner shortcut */}
      {onNavigateToGuests && (
        <div className="bg-gradient-to-r from-[#FAF0E6] via-[#FDFBF7] to-[#F7EBE8] border border-[#E8D7C3] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B2503A]/10 text-[#B2503A] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-heading font-bold text-sm sm:text-base text-[#2C2420]">
                Guest Hotel & Travel Logistics (Excel Import)
              </h4>
              <p className="text-xs text-[#7A6B60]">
                Upload and track room allocations, flight/train arrival times, and pickup coordinators.
              </p>
            </div>
          </div>
          <button
            id="task-manager-goto-guests-btn"
            onClick={onNavigateToGuests}
            className="px-4 py-2 rounded-xl bg-[#8C6221] hover:bg-[#73501A] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span>Open Guests & Travel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Stats Bar: Total tasks, Done, Pending — plus a progress bar */}
      <section id="task-stats-bar" className="luxury-card rounded-3xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF0E6] flex items-center justify-center text-[#8C6221] shrink-0">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif-heading text-xl md:text-2xl font-bold text-[#2C2420]">
                Task Execution Progress
              </h2>
              <p className="text-xs text-[#7A6B60]">
                Milestones and operational duties across all wedding ceremonies
              </p>
            </div>
          </div>

          {/* Quick Add Task Button */}
          <button
            id="open-add-task-modal-btn"
            onClick={() => setIsAddingTask(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B2503A] to-[#8F3B27] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>

        {/* 3 Stats Badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD1] text-center">
            <span className="block text-[11px] uppercase tracking-wider text-[#8C7A6B] font-medium">
              Total Tasks
            </span>
            <span className="font-serif-heading text-xl sm:text-2xl font-bold text-[#2C2420]">
              {totalTasks}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EFF8F2] border border-[#CDE5D5] text-center">
            <span className="block text-[11px] uppercase tracking-wider text-emerald-800 font-medium">
              Done / Completed
            </span>
            <span className="font-serif-heading text-xl sm:text-2xl font-bold text-emerald-700">
              {doneTasks}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FDF2F0] border border-[#F3D7CA] text-center">
            <span className="block text-[11px] uppercase tracking-wider text-[#B2503A] font-medium">
              Pending / In Progress
            </span>
            <span className="font-serif-heading text-xl sm:text-2xl font-bold text-[#B2503A]">
              {pendingTasks}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-[#7A6B60]">
            <span className="font-medium">Completion Rate</span>
            <span className="font-bold text-[#2C2420]">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-3 bg-[#EFE9DF] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C5A059] to-[#8C6221] rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* 3. Upcoming Tasks — next 3 tasks sorted by nearest deadline (only showing tasks that exist and aren't Done) */}
      <section id="upcoming-tasks-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
            <h3 className="font-serif-heading text-xl font-bold text-[#2C2420]">
              Upcoming Tasks (Nearest Deadlines)
            </h3>
          </div>
          <span className="text-xs text-[#8C7A6B]">
            Showing top {upcomingTasks.length} pending
          </span>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-[#E8D7C3] text-center text-xs text-[#8C7A6B] italic">
            No upcoming pending tasks found with deadlines. You are all caught up!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {upcomingTasks.map((task) => {
              const overdue = isTaskOverdue(task);
              const daysLeft = Math.ceil(
                (new Date(task.deadline).getTime() - new Date(todayStr).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={task.id}
                  id={`upcoming-task-${task.id}`}
                  className={`p-4 rounded-2xl luxury-card transition-all flex flex-col justify-between ${
                    overdue
                      ? 'border-rose-300 bg-[#FFF8F7]'
                      : 'border-[#E8D7C3] hover:border-[#C5A059]'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header: Event and Overdue badge */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#8C6221] border border-[#E0CFBD]">
                        {task.event}
                      </span>

                      {overdue ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          <span>Overdue</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#7A6B60] font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C5A059]" />
                          <span>
                            {daysLeft === 0
                              ? 'Due Today'
                              : daysLeft === 1
                              ? 'Due Tomorrow'
                              : `Due in ${daysLeft} days`}
                          </span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-semibold text-sm text-[#2C2420] line-clamp-2">
                      {task.name}
                    </h4>

                    {task.notes && (
                      <p className="text-xs text-[#7A6B60] line-clamp-2 italic bg-white/70 p-1.5 rounded-lg border border-[#F0E6DA]">
                        "{task.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F0E6DA] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[#66554A]">
                      <User className="w-3.5 h-3.5 text-[#B2503A]" />
                      <span className="font-medium truncate max-w-[110px]">
                        {task.assignedTo}
                      </span>
                    </div>

                    {/* Quick complete button */}
                    <button
                      id={`complete-upcoming-task-${task.id}`}
                      onClick={() => handleStatusChange(task.id, 'Done')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                      title="Mark as Done"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. "View By" Toggle:
          Overall (Kanban board with 3 columns — Pending, In Progress, Done)
          OR
          Person (dropdown to select a person, shows their tasks in a collapsible accordion by status) */}
      <section id="view-by-tasks-section" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8D7C3] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B2503A] mb-1">
              <Columns3 className="w-3.5 h-3.5" />
              <span>Workflow Workspace</span>
            </div>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C2420]">
              {viewBy === 'Overall' ? 'Overall Kanban Board' : 'Tasks by Family Member'}
            </h2>
          </div>

          {/* Toggle buttons: Overall vs Person */}
          <div className="flex items-center p-1 rounded-2xl bg-[#EFE8DD] border border-[#DFD3C3] self-start sm:self-auto">
            <button
              id="view-by-overall-btn"
              onClick={() => setViewBy('Overall')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewBy === 'Overall'
                  ? 'bg-white text-[#2C2420] shadow-sm'
                  : 'text-[#7A6B60] hover:text-[#2C2420]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Overall (Kanban)</span>
            </button>
            <button
              id="view-by-person-btn"
              onClick={() => setViewBy('Person')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewBy === 'Person'
                  ? 'bg-white text-[#2C2420] shadow-sm'
                  : 'text-[#7A6B60] hover:text-[#2C2420]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>By Person</span>
            </button>
          </div>
        </div>

        {/* --- VIEW 1: OVERALL KANBAN BOARD (3 COLUMNS) --- */}
        {viewBy === 'Overall' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* Column 1: Pending */}
            <div
              id="kanban-column-pending"
              className="rounded-2xl bg-[#FAF6F0] border border-[#E8DDD1] p-4 flex flex-col space-y-3 min-h-[360px]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E2D5C8]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <h3 className="font-serif-heading font-bold text-base text-[#2C2420]">
                    Pending
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#7A6B60] border border-[#DFD3C3]">
                  {tasks.filter((t) => t.status === 'Pending').length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {tasks
                  .filter((t) => t.status === 'Pending')
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isOverdue={isTaskOverdue(task)}
                      onUpdateStatus={handleStatusChange}
                      onDelete={onDeleteTask}
                    />
                  ))}

                {tasks.filter((t) => t.status === 'Pending').length === 0 && (
                  <div className="p-6 text-center text-xs text-[#8C7A6B] italic">
                    No pending tasks in queue.
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div
              id="kanban-column-inprogress"
              className="rounded-2xl bg-[#FAF4EA] border border-[#E8DAC5] p-4 flex flex-col space-y-3 min-h-[360px]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E0CFB5]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#8C6221]" />
                  <h3 className="font-serif-heading font-bold text-base text-[#2C2420]">
                    In Progress
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#7A6B60] border border-[#E0CFB5]">
                  {tasks.filter((t) => t.status === 'In Progress').length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {tasks
                  .filter((t) => t.status === 'In Progress')
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isOverdue={isTaskOverdue(task)}
                      onUpdateStatus={handleStatusChange}
                      onDelete={onDeleteTask}
                    />
                  ))}

                {tasks.filter((t) => t.status === 'In Progress').length === 0 && (
                  <div className="p-6 text-center text-xs text-[#8C7A6B] italic">
                    No active tasks currently in progress.
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Done */}
            <div
              id="kanban-column-done"
              className="rounded-2xl bg-[#EFF8F2] border border-[#CDE5D5] p-4 flex flex-col space-y-3 min-h-[360px]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#BFDEC9]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <h3 className="font-serif-heading font-bold text-base text-emerald-950">
                    Done
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-emerald-800 border border-[#BFDEC9]">
                  {tasks.filter((t) => t.status === 'Done').length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {tasks
                  .filter((t) => t.status === 'Done')
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isOverdue={false}
                      onUpdateStatus={handleStatusChange}
                      onDelete={onDeleteTask}
                    />
                  ))}

                {tasks.filter((t) => t.status === 'Done').length === 0 && (
                  <div className="p-6 text-center text-xs text-[#8C7A6B] italic">
                    No tasks completed yet. Check off tasks as you finish them!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* --- VIEW 2: PERSON VIEW (Dropdown + Collapsible Accordions by Status) --- */
          <div className="space-y-6">
            {/* Person selector card */}
            <div className="luxury-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8C7A6B] block">
                  Select Family Member:
                </span>
                <select
                  id="task-person-select"
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="mt-1 px-4 py-2 bg-white border border-[#D9C8B5] rounded-xl text-sm font-semibold text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40 min-w-[260px]"
                >
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name} ({member.relationRole})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF0E6] text-[#8C6221]">
                  <span className="font-bold">{personTasks.length}</span> assigned
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                  <span className="font-bold">{personTasksByStatus['Done'].length}</span> done
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800">
                  <span className="font-bold">
                    {personTasksByStatus['Pending'].length +
                      personTasksByStatus['In Progress'].length}
                  </span>{' '}
                  pending
                </div>
              </div>
            </div>

            {/* Accordions for Pending, In Progress, Done */}
            {(['Pending', 'In Progress', 'Done'] as TaskStatus[]).map((status) => {
              const items = personTasksByStatus[status] || [];
              const isOpen = openPersonStatuses[status] !== false;

              const getStatusTheme = () => {
                if (status === 'Done') return 'bg-emerald-50 border-emerald-200 text-emerald-900';
                if (status === 'In Progress') return 'bg-amber-50 border-amber-200 text-amber-900';
                return 'bg-[#FAF6F0] border-[#E8DDD1] text-[#2C2420]';
              };

              return (
                <div
                  key={status}
                  id={`person-status-accordion-${status.toLowerCase().replace(/\s+/g, '-')}`}
                  className="rounded-2xl border border-[#E8D7C3] bg-white overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleStatusAccordion(status)}
                    className={`w-full px-5 py-3.5 transition-colors flex items-center justify-between text-left cursor-pointer ${getStatusTheme()}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          status === 'Done'
                            ? 'bg-emerald-600'
                            : status === 'In Progress'
                            ? 'bg-[#8C6221]'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span className="font-serif-heading font-bold text-base">{status}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white text-[#7A6B60] border border-[#DFD3C3]">
                        {items.length} {items.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>

                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#8C7A6B]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8C7A6B]" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 space-y-3 bg-[#FAF8F5]/40">
                      {items.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#8C7A6B] italic">
                          No {status.toLowerCase()} tasks assigned to {selectedPerson}.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {items.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              isOverdue={isTaskOverdue(task)}
                              onUpdateStatus={handleStatusChange}
                              onDelete={onDeleteTask}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --- ADD TASK MODAL / SHEET --- */}
      {isAddingTask && (
        <div
          id="add-task-modal-overlay"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8D7C3] relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6DA]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B2503A]" />
                <h3 className="font-serif-heading text-xl font-bold text-[#2C2420]">
                  Create New Wedding Task
                </h3>
              </div>
              <button
                onClick={() => setIsAddingTask(false)}
                className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#8C7A6B] hover:text-[#2C2420] flex items-center justify-center text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
              {/* Task Name */}
              <div>
                <label
                  htmlFor="new-task-name-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
                >
                  Task Name / Objective *
                </label>
                <input
                  id="new-task-name-input"
                  type="text"
                  placeholder="e.g. Confirm floral chandelier rigging for Sangeet"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event dropdown */}
                <div>
                  <label
                    htmlFor="new-task-event-select"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
                  >
                    Event *
                  </label>
                  <select
                    id="new-task-event-select"
                    value={newEvent}
                    onChange={(e) =>
                      setNewEvent(e.target.value as WeddingEvent | 'General / Pre-Wedding')
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-xs sm:text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  >
                    <option value="General / Pre-Wedding">General / Pre-Wedding</option>
                    {WEDDING_EVENTS.map((ev) => (
                      <option key={ev} value={ev}>
                        {ev}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned To dropdown */}
                <div>
                  <label
                    htmlFor="new-task-assigned-select"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
                  >
                    Assigned To *
                  </label>
                  <select
                    id="new-task-assigned-select"
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-xs sm:text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.relationRole})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline date */}
              <div>
                <label
                  htmlFor="new-task-deadline-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
                >
                  Deadline Date *
                </label>
                <input
                  id="new-task-deadline-input"
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>

              {/* Notes optional */}
              <div>
                <label
                  htmlFor="new-task-notes-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
                >
                  Notes & Vendor Instructions (Optional)
                </label>
                <textarea
                  id="new-task-notes-input"
                  rows={3}
                  placeholder="e.g. Speak with supplier Amit at +91-98290... before paying 20% advance"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-xs sm:text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0E6DA]">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 rounded-xl border border-[#D9C8B5] text-xs font-semibold text-[#7A6B60] hover:bg-[#FAF6F0]"
                >
                  Cancel
                </button>
                <button
                  id="save-new-task-btn"
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#B2503A] hover:bg-[#9E2A2B] text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Individual Task Card with Overdue indicator, Event, Assigned To, Deadline, Notes, Actions
interface TaskCardProps {
  task: Task;
  isOverdue: boolean;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isOverdue,
  onUpdateStatus,
  onDelete,
}) => {
  return (
    <div
      id={`task-card-${task.id}`}
      className={`p-4 rounded-2xl bg-white border transition-all duration-200 shadow-xs hover:shadow-md ${
        isOverdue
          ? 'border-rose-300 ring-1 ring-rose-300/60 bg-[#FFFBFB]'
          : task.status === 'Done'
          ? 'border-emerald-200 bg-[#F9FDFB]'
          : 'border-[#E8DDD1] hover:border-[#C5A059]'
      }`}
    >
      {/* Top badges: Event & Overdue */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#8C6221] border border-[#E0CFBD] truncate max-w-[140px]">
          {task.event}
        </span>

        {isOverdue && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Overdue!</span>
          </span>
        )}
      </div>

      {/* Task Name */}
      <h4
        className={`font-semibold text-sm leading-snug mb-1.5 ${
          task.status === 'Done'
            ? 'line-through text-[#8C7A6B]'
            : 'text-[#2C2420]'
        }`}
      >
        {task.name}
      </h4>

      {/* Notes if any */}
      {task.notes && (
        <p className="text-xs text-[#7A6B60] line-clamp-2 bg-[#FAF8F5] p-2 rounded-lg border border-[#F0E8DE] mb-2.5 italic">
          "{task.notes}"
        </p>
      )}

      {/* Details metadata: Assignee & Deadline */}
      <div className="space-y-1 text-xs text-[#7A6B60] mb-3">
        <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 text-[#B2503A]" />
          <span className="font-medium text-[#2C2420] truncate">
            {task.assignedTo}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-[#C5A059]" />
          <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
            Deadline: {task.deadline || 'None'}
          </span>
        </div>
      </div>

      {/* Bottom Status Buttons & Delete */}
      <div className="pt-2 border-t border-[#F0E6DA] flex items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-1">
          {task.status !== 'Pending' && (
            <button
              onClick={() => onUpdateStatus(task.id, 'Pending')}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAF0E6] text-[#8C6221] hover:bg-[#F3E2D2]"
              title="Move to Pending"
            >
              Pending
            </button>
          )}

          {task.status !== 'In Progress' && (
            <button
              onClick={() => onUpdateStatus(task.id, 'In Progress')}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              title="Move to In Progress"
            >
              In Progress
            </button>
          )}

          {task.status !== 'Done' && (
            <button
              onClick={() => onUpdateStatus(task.id, 'Done')}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
              title="Mark Completed"
            >
              ✓ Done
            </button>
          )}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-[#A39284] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
