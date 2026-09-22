import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Calendar, Tag, ChevronDown, ListTodo, X, FolderPlus, Trash2, Clock, MapPin, Timer, Coffee, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Category, SubTask, Event, View } from '../types';

interface DashboardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  events: Event[];
  onOpenAI?: () => void;
  onNavigate?: (view: View) => void;
}

export default function Dashboard({ tasks, setTasks, categories, setCategories, events, onOpenAI, onNavigate }: DashboardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // New Task Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: categories[0]?.name || 'General',
    priority: 'medium' as Task['priority'],
    tags: [] as string[],
    newTag: '',
    dueDate: new Date().toISOString(),
    subtasks: [] as SubTask[],
    newSubTask: '',
  });

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      completed: false,
      category: taskForm.category,
      priority: taskForm.priority,
      tags: taskForm.tags,
      dueDate: taskForm.dueDate,
      subtasks: taskForm.subtasks,
    };
    
    setTasks(prev => [newTask, ...prev]);
    // Reset form
    setTaskForm({ 
      title: '', 
      description: '', 
      category: categories[0]?.name || 'General', 
      priority: 'medium', 
      tags: [], 
      newTag: '', 
      dueDate: new Date().toISOString(),
      subtasks: [],
      newSubTask: '',
    });
    setIsAdding(false);
  };

  const addTag = () => {
    if (taskForm.newTag.trim() && !taskForm.tags.includes(taskForm.newTag.trim())) {
      setTaskForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTaskForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const addSubTask = () => {
    if (taskForm.newSubTask.trim()) {
      const newSub: SubTask = {
        id: Date.now().toString(),
        title: taskForm.newSubTask.trim(),
        completed: false,
      };
      setTaskForm(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, newSub],
        newSubTask: ''
      }));
    }
  };

  const removeSubTask = (id: string) => {
    setTaskForm(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== id)
    }));
  };

  const addNewCategory = () => {
    const name = prompt("Enter folder name:");
    if (name) {
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
      const newCat: Category = {
        id: Date.now().toString(),
        name,
        color: colors[categories.length % colors.length]
      };
      setCategories(prev => [...prev, newCat]);
    }
  };

  const filteredTasks = selectedCategory 
    ? tasks.filter(t => t.category === selectedCategory)
    : tasks;

  const completedCount = filteredTasks.filter(t => t.completed).length;

  return (
    <div className="p-6 pb-32">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-neutral-400 font-mono tracking-tighter uppercase">May 16, 2026</span>
          <div className="w-8 h-8 rounded-full bg-neutral-200 border border-neutral-300" />
        </div>
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2 italic">Architect</h1>
        <p className="text-neutral-500 text-sm">
          Protocol active. <span className="text-neutral-900 font-bold">{filteredTasks.length - completedCount} signals</span> awaiting resolve.
        </p>
      </header>

      {/* Progress Card */}
      <div className="bg-neutral-900 rounded-3xl p-6 text-white mb-8 card-shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Daily Progress</h3>
            <p className="text-xs text-neutral-400">Keep going, you're doing great!</p>
          </div>
          <div className="text-3xl font-display italic">
            {Math.round((completedCount / (filteredTasks.length || 1)) * 100)}%
          </div>
        </div>
        <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / (filteredTasks.length || 1)) * 100}%` }}
            className="h-full bg-white"
          />
        </div>
      </div>

      {/* Categories/Folders Section */}
      <div className="mb-10 overflow-x-auto no-scrollbar">
        <div className="flex space-x-3 pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === null 
              ? 'bg-neutral-900 text-white shadow-lg' 
              : 'bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300'
            }`}
          >
            All Tasks
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-2 ${
                selectedCategory === cat.name 
                ? 'bg-neutral-900 text-white shadow-lg' 
                : 'bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
            </button>
          ))}
          <button 
            id="add-folder-btn"
            onClick={addNewCategory}
            className="px-5 py-2.5 rounded-full text-neutral-400 border border-neutral-200 border-dashed hover:border-neutral-300 transition-all flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Add Folder</span>
          </button>
        </div>
      </div>

      {/* Zen/Focus Widget */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-display italic">Deep Focus</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Zen State</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => onNavigate?.('focus')}
            className="bg-white border border-neutral-100 rounded-[2rem] p-6 card-shadow flex flex-col justify-between h-32 relative overflow-hidden group hover:border-neutral-200 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center">
                <Timer className="w-5 h-5 text-neutral-900" />
              </div>
              <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-neutral-900">Concentrate</h4>
              <p className="text-[10px] text-neutral-400 font-mono">25:00 ready</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-neutral-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>
          <div 
            onClick={() => onNavigate?.('focus')}
            className="bg-white border border-neutral-100 rounded-[2rem] p-6 card-shadow flex flex-col justify-between h-32 relative overflow-hidden group hover:border-neutral-200 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm text-neutral-900">Recover</h4>
              <p className="text-[10px] text-neutral-400 font-mono">5:00 breather</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Widget */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-display italic">Upcoming Events</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Chronos</span>
        </div>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4">
          {events.length === 0 ? (
            <div 
              onClick={() => onNavigate?.('calendar')}
              className="w-full py-8 border border-dashed border-neutral-200 rounded-[2rem] text-center cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <p className="text-xs text-neutral-400 italic">Static presence</p>
            </div>
          ) : (
            events.map(event => (
              <div 
                key={event.id}
                onClick={() => onNavigate?.('calendar')}
                className="flex-shrink-0 w-64 bg-white border border-neutral-100 rounded-[2rem] p-5 card-shadow flex flex-col justify-between space-y-4 hover:border-neutral-200 cursor-pointer transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm text-neutral-900 line-clamp-1">{event.title}</h3>
                    <div className="w-2 h-2 rounded-full bg-neutral-900" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center text-[10px] text-neutral-500 space-x-2 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-[10px] text-neutral-500 space-x-2 font-mono">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {event.tags.map(tag => (
                    <span key={tag} className="text-[8px] uppercase tracking-widest font-mono text-neutral-400">#{tag}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Assistant Widget */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-display italic">Neural Assistant</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Gemini Core</span>
        </div>
        <button 
          onClick={onOpenAI}
          className="w-full bg-neutral-900 text-white rounded-[2.5rem] p-8 card-shadow relative overflow-hidden group active:scale-[0.98] transition-all"
        >
          <div className="flex justify-between items-center relative z-10">
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">AI Enabled</span>
              </div>
              <h3 className="text-2xl font-bold font-display tracking-tight mb-1">Generate Flow</h3>
              <p className="text-xs text-neutral-400 max-w-[180px]">Talk to create tasks, events, and notes automatically.</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Wand2 className="w-6 h-6" />
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
          <div className="absolute left-1/2 -bottom-10 w-40 h-40 bg-neutral-800 rounded-full blur-3xl" />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-display">
            {selectedCategory || 'Recent Tasks'}
          </h2>
          <button 
            id="add-task-btn"
            onClick={() => setIsAdding(true)}
            className="p-3 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-5 h-5 text-neutral-700" />
          </button>
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 opacity-30">
              <ListTodo className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No tasks found here</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                layout
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col space-y-3 ${
                  task.completed 
                  ? 'bg-neutral-50 border-neutral-100 opacity-60' 
                  : 'bg-white border-neutral-200 card-shadow hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-neutral-900" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-300" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                      {task.title}
                    </h4>
                    {task.description && !task.completed && (
                      <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                  <div className={`w-1.5 h-6 rounded-full ${
                    task.priority === 'high' ? 'bg-red-400' : 
                    task.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                  }`} />
                </div>
                
                {(task.tags && task.tags.length > 0 || task.subtasks && task.subtasks.length > 0) && (
                  <div className="flex flex-col space-y-3 pl-9">
                    {task.subtasks && task.subtasks.length > 0 && !task.completed && (
                      <div className="space-y-1.5">
                        {task.subtasks.map(sub => (
                          <div 
                            key={sub.id} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setTasks(prev => prev.map(t => 
                                t.id === task.id 
                                  ? { ...t, subtasks: t.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s) } 
                                  : t
                              ));
                            }}
                            className="flex items-center space-x-2 group"
                          >
                            {sub.completed ? (
                              <CheckCircle2 className="w-3 h-3 text-neutral-900" />
                            ) : (
                              <Circle className="w-3 h-3 text-neutral-300 group-hover:text-neutral-400" />
                            )}
                            <span className={`text-[10px] ${sub.completed ? 'line-through text-neutral-400' : 'text-neutral-600'}`}>{sub.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      {task.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 bg-neutral-50 text-neutral-400 border border-neutral-100 rounded-md font-mono">
                          #{tag}
                        </span>
                      ))}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <span className="text-[9px] text-neutral-400 font-mono">
                           {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} steps
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Enhanced Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[60] flex items-end justify-center sm:items-center p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 card-shadow overflow-y-auto max-h-[95vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-display italic">Define Objective</h2>
                  <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-mono">Precision leads to success</p>
                </div>
                <button 
                  id="close-modal" 
                  onClick={() => setIsAdding(false)} 
                  className="p-2 bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={addTask} className="space-y-6">
                <div className="space-y-5">
                  {/* Title & Description */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Title</label>
                      <input
                        autoFocus
                        type="text"
                        placeholder="What's the main goal?"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full text-xl font-medium focus:outline-none bg-neutral-50 rounded-2xl p-4 border border-transparent focus:border-neutral-200 transition-all shadow-inner"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Context & Details</label>
                      <textarea
                        placeholder="Add deeper insights or requirements..."
                        value={taskForm.description}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full min-h-[80px] text-sm bg-neutral-50 rounded-2xl p-4 border border-transparent focus:border-neutral-200 transition-all resize-none focus:outline-none text-neutral-600 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Sub-tasks Section */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Breakdown (Sub-tasks)</label>
                    <div className="bg-neutral-50 rounded-2xl p-4 border border-transparent shadow-inner">
                      <div className="space-y-2 mb-3">
                        {taskForm.subtasks.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                              <span className="text-sm text-neutral-600 font-medium">{sub.title}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeSubTask(sub.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Add a step..."
                          value={taskForm.newSubTask}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, newSubTask: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSubTask();
                            }
                          }}
                          className="flex-1 bg-transparent text-sm focus:outline-none border-b border-neutral-200 pb-1"
                        />
                        <button type="button" onClick={addSubTask} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Due Date</label>
                      <input
                        type="date"
                        value={taskForm.dueDate ? taskForm.dueDate.split('T')[0] : ''}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                        className="w-full bg-neutral-50 rounded-2xl p-4 text-xs font-medium border border-transparent focus:border-neutral-200 transition-all focus:outline-none shadow-inner"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Folder</label>
                      <div className="relative">
                        <select 
                          value={taskForm.category}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full appearance-none bg-neutral-50 rounded-2xl p-4 text-xs font-medium border border-transparent focus:border-neutral-200 transition-all focus:outline-none shadow-inner"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Priority</label>
                      <div className="relative">
                        <select 
                          value={taskForm.priority}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full appearance-none bg-neutral-50 rounded-2xl p-4 text-xs font-medium border border-transparent focus:border-neutral-200 transition-all focus:outline-none shadow-inner capitalize"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Tags</label>
                      <div className="bg-neutral-50 rounded-2xl p-4 border border-transparent focus-within:border-neutral-200 transition-all shadow-inner">
                        <div className="flex flex-wrap gap-1 mb-2">
                           {taskForm.tags.map(tag => (
                             <span key={tag} className="flex items-center space-x-1 px-2 py-0.5 bg-white rounded text-[8px] font-bold text-neutral-500 border border-neutral-100 uppercase tracking-widest">
                               <span>{tag}</span>
                               <button type="button" onClick={() => removeTag(tag)} className="text-neutral-300 hover:text-red-400">
                                 <X className="w-2.5 h-2.5" />
                               </button>
                             </span>
                           ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add tag..."
                            value={taskForm.newTag}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, newTag: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                            className="flex-1 bg-transparent text-[10px] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex pt-6">
                  <button 
                    id="create-task-btn"
                    type="submit"
                    className="w-full bg-neutral-900 text-white rounded-[2rem] py-5 font-bold text-lg hover:bg-black transition-all active:scale-[0.98] shadow-2xl shadow-neutral-900/20 flex items-center justify-center space-x-2"
                  >
                    <span>Commit Objective</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
