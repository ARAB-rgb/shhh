import React, { useState } from 'react';
import {
  ArrowLeft,
  Sun,
  Star,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Search,
  Check,
  Clock,
  Tag,
  AlertCircle,
  ChevronRight,
  ListTodo,
  Sparkles,
  BarChart2,
  Download,
} from 'lucide-react';
import { ToDoIcon } from '../icons/AppIcons';
import { TaskItem } from '../../types/suite';
import { storage } from '../../services/storage';

interface ToDoAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

interface EnhancedTaskItem extends TaskItem {
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  subtasks?: { id: string; title: string; completed: boolean }[];
  notes?: string;
}

export const ToDoApp: React.FC<ToDoAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const [tasks, setTasks] = useState<EnhancedTaskItem[]>(() => {
    const raw = storage.getTasks();
    return raw.map((t) => ({
      ...t,
      priority: t.isImportant ? 'urgent' : 'normal',
      subtasks: [
        { id: 'st-1', title: isAr ? 'مراجعة المتطلبات الأساسية' : 'Review core requirements', completed: t.completed },
        { id: 'st-2', title: isAr ? 'التأكيد مع فريق العمل' : 'Confirm with project team', completed: false },
      ],
    }));
  });

  const [activeCategory, setActiveCategory] = useState<'my-day' | 'important' | 'planned' | 'tasks'>('my-day');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'normal'>('normal');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>(isAr ? 'اليوم' : 'Today');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Task for side inspector
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<string>('');

  const filteredTasks = tasks
    .filter((t) => {
      if (activeCategory === 'my-day') return t.category === 'my-day';
      if (activeCategory === 'important') return t.isImportant || t.priority === 'urgent';
      if (activeCategory === 'planned') return t.category === 'planned';
      return true;
    })
    .filter((t) => (searchQuery ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) : true));

  const toggleTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    storage.saveTasks(updated);
  };

  const toggleImportant = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: EnhancedTaskItem[] = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            isImportant: !t.isImportant,
            priority: (!t.isImportant ? 'urgent' : 'normal') as 'urgent' | 'normal',
          }
        : t
    );
    setTasks(updated);
    storage.saveTasks(updated);
  };

  const deleteTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    storage.saveTasks(updated);
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: EnhancedTaskItem = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      category: activeCategory,
      dueDate: newTaskDueDate,
      isImportant: newTaskPriority === 'urgent' || activeCategory === 'important',
      priority: newTaskPriority,
      subtasks: [],
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    storage.saveTasks(updated);
    setNewTaskTitle('');
    setSelectedTaskId(newTask.id);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !selectedTaskId) return;

    const updated = tasks.map((t) => {
      if (t.id === selectedTaskId) {
        return {
          ...t,
          subtasks: [
            ...(t.subtasks || []),
            { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
          ],
        };
      }
      return t;
    });

    setTasks(updated);
    storage.saveTasks(updated);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: (t.subtasks || []).map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      }
      return t;
    });
    setTasks(updated);
    storage.saveTasks(updated);
  };

  // Completion Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <ToDoIcon className="w-8 h-8 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-gray-900">{isAr ? 'مهام وإنتاجية SNNS Tasks' : 'SNNS Tasks Enterprise'}</h1>
              <span className="text-[10px] bg-blue-100 text-[#0078D4] font-bold px-2 py-0.5 rounded-full">
                {completionPercentage}% {isAr ? 'منجز' : 'Completed'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              {tasks.filter((t) => !t.completed).length} {isAr ? 'مهام متبقية • تزامن سحابي فوري' : 'tasks remaining • Real-time cloud sync'}
            </p>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="hidden sm:flex items-center gap-3 bg-gray-50 px-3.5 py-1.5 rounded-2xl border border-gray-200">
          <div className="w-28 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
          </div>
          <span className="text-xs font-mono font-bold text-gray-700">
            {completedTasks}/{totalTasks}
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-60 bg-white border-e border-gray-200 p-3 select-none text-xs space-y-1">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في المهام...' : 'Search tasks...'}
              className="w-full ps-8 pe-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setActiveCategory('my-day')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
              activeCategory === 'my-day' ? 'bg-blue-50 text-[#0078D4] font-bold' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'يومي (My Day)' : 'My Day'}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              {tasks.filter((t) => t.category === 'my-day' && !t.completed).length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('important')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
              activeCategory === 'important' ? 'bg-blue-50 text-[#0078D4] font-bold' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-rose-500" />
              <span>{isAr ? 'هام وعاجل' : 'Important'}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              {tasks.filter((t) => (t.isImportant || t.priority === 'urgent') && !t.completed).length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('planned')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
              activeCategory === 'planned' ? 'bg-blue-50 text-[#0078D4] font-bold' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>{isAr ? 'المخطط لها' : 'Planned'}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              {tasks.filter((t) => t.category === 'planned' && !t.completed).length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('tasks')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
              activeCategory === 'tasks' ? 'bg-blue-50 text-[#0078D4] font-bold' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ListTodo className="w-4 h-4 text-[#0078D4]" />
              <span>{isAr ? 'كافة المهام' : 'All Tasks'}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              {tasks.filter((t) => !t.completed).length}
            </span>
          </button>
        </aside>

        {/* Center Tasks List */}
        <main className="flex-1 bg-white p-4 sm:p-6 overflow-y-auto flex flex-col space-y-4">
          {/* Add Task Input Form */}
          <form onSubmit={handleAddTask} className="bg-gray-50 p-3 rounded-2xl border border-gray-200/90 flex flex-col sm:flex-row items-center gap-2 shadow-xs">
            <div className="flex items-center gap-2 flex-1 w-full">
              <Plus className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={isAr ? 'أضف مهمة جديدة واضغط Enter...' : 'Add a new task and press Enter...'}
                className="w-full bg-transparent text-xs font-medium text-gray-900 focus:outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700"
              >
                <option value="normal">{isAr ? 'أولوية عادية' : 'Normal Priority'}</option>
                <option value="high">{isAr ? 'أولوية عالية' : 'High Priority'}</option>
                <option value="urgent">{isAr ? 'عاجل جداً' : 'Urgent'}</option>
              </select>

              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-3.5 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] disabled:bg-gray-200 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isAr ? 'إضافة' : 'Add'}
              </button>
            </div>
          </form>

          {/* Tasks List */}
          <div className="space-y-2 flex-1">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((t) => {
                const isSelected = selectedTaskId === t.id;
                const completedSubtasks = (t.subtasks || []).filter((st) => st.completed).length;
                const totalSubtasks = (t.subtasks || []).length;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#0078D4] bg-sky-50/40 shadow-xs ring-1 ring-[#0078D4]'
                        : t.completed
                        ? 'bg-gray-50/60 border-gray-200 opacity-60'
                        : 'bg-white border-gray-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => toggleTask(t.id, e)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 cursor-pointer ${
                          t.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 hover:border-[#0078D4]'
                        }`}
                      >
                        {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <span className={`text-xs font-semibold block truncate ${t.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {t.title}
                        </span>

                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
                          {t.dueDate && <span>{t.dueDate}</span>}
                          {totalSubtasks > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-[#0078D4] font-bold">
                                {completedSubtasks}/{totalSubtasks} {isAr ? 'مهام فرعية' : 'subtasks'}
                              </span>
                            </>
                          )}
                          {t.priority === 'urgent' && (
                            <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                              {isAr ? 'عاجل' : 'Urgent'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => toggleImportant(t.id, e)}
                        className="p-1.5 text-gray-400 hover:text-amber-500 transition cursor-pointer"
                        title={isAr ? 'تمييز كمهمة هامة' : 'Mark Important'}
                      >
                        <Star className={`w-4 h-4 ${t.isImportant ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => deleteTask(t.id, e)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                        title={isAr ? 'حذف المهمة' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 py-16">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-xs font-medium">{isAr ? 'لا توجد مهام متبقية في هذه القائمة! أحسنت صنعاً.' : 'No tasks in this list! All caught up.'}</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Subtasks & Details Inspector */}
        {selectedTask && (
          <aside className="w-72 bg-gray-50 border-s border-gray-200 p-4 flex flex-col space-y-4 text-xs select-none">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-gray-900 text-xs truncate">{selectedTask.title}</span>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Subtasks Section */}
            <div className="space-y-2">
              <span className="font-bold text-gray-700 block text-xs">{isAr ? 'المهام الفرعية (Subtasks):' : 'Subtasks Checklist:'}</span>
              <div className="space-y-1.5">
                {(selectedTask.subtasks || []).map((st) => (
                  <div
                    key={st.id}
                    onClick={() => toggleSubtask(selectedTask.id, st.id)}
                    className="p-2 bg-white rounded-xl border border-gray-200 flex items-center gap-2 cursor-pointer hover:border-sky-300 transition"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                        st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                      }`}
                    >
                      {st.completed && <Check className="w-3 h-3" />}
                    </div>
                    <span className={`text-[11px] truncate ${st.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Subtask Form */}
              <form onSubmit={handleAddSubtask} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder={isAr ? '+ خطوة فرعية...' : '+ Add subtask step...'}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-[11px] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-2.5 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold"
                >
                  ✓
                </button>
              </form>
            </div>

            {/* Task Meta details */}
            <div className="pt-2 border-t border-gray-200 space-y-2 text-[11px] text-gray-500">
              <div className="flex justify-between">
                <span>{isAr ? 'تاريخ الاستحقاق:' : 'Due Date:'}</span>
                <span className="font-bold text-gray-800">{selectedTask.dueDate || 'Today'}</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'الأولوية:' : 'Priority:'}</span>
                <span className="font-bold text-gray-800 uppercase">{selectedTask.priority || 'Normal'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => deleteTask(selectedTask.id)}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'حذف هذه المهمة' : 'Delete Task'}</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
