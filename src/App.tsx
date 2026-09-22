import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Calendar as CalendarIcon, NotebookPen, Settings as SettingsIcon, Timer } from 'lucide-react';
import { View, Task, Note, Category, Event } from './types';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Notes from './components/Notes';
import Settings from './components/Settings';
import FocusTimer from './components/FocusTimer';
import AIChat from './components/AIChat';
import Auth from './components/Auth';

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Work', color: '#3B82F6' },
  { id: '2', name: 'Personal', color: '#EF4444' },
  { id: '3', name: 'Shopping', color: '#10B981' },
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Complete initial design', completed: true, category: 'Work', tags: ['design'], priority: 'high', dueDate: new Date().toISOString(), subtasks: [] },
  { id: '2', title: 'Implement navigation bar', completed: true, category: 'Work', tags: ['ui'], priority: 'medium', dueDate: new Date().toISOString(), subtasks: [] },
  { id: '3', title: 'Create mock data structures', completed: false, category: 'Personal', tags: ['logic'], priority: 'low', dueDate: new Date().toISOString(), subtasks: [] },
  { id: '4', title: 'Review feedback from stakeholders', completed: false, category: 'Work', tags: ['meeting'], priority: 'high', dueDate: new Date().toISOString(), subtasks: [] },
];

const INITIAL_NOTES: Note[] = [
  { 
    id: '1', 
    title: 'Project Ideas', 
    content: 'Focus on simplicity and mobile-first design. Use high contrast for readability.', 
    updatedAt: new Date().toISOString(),
    tags: ['design', 'strategy'],
    pinned: true,
    color: '#171717'
  },
  { 
    id: '2', 
    title: 'Meeting Notes', 
    content: 'Discussed the need for a more robust backend integration later on.', 
    updatedAt: new Date().toISOString(),
    tags: ['development'],
    pinned: false
  },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Design Sync',
    date: new Date().toISOString(),
    startTime: '10:00',
    endTime: '11:00',
    location: 'Google Meet',
    description: 'Weekly design review with the team.',
    tags: ['work', 'design'],
    category: 'Work',
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Persistence for mock auth
  useEffect(() => {
    const authStatus = localStorage.getItem('flow_auth');
    if (authStatus === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('flow_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('flow_auth');
    setCurrentView('dashboard');
  };

  const handleAIAddTask = (aiData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: aiData.title || 'New Task',
      description: aiData.description,
      completed: false,
      category: aiData.category || 'General',
      priority: aiData.priority || 'medium',
      tags: aiData.tags || [],
      dueDate: aiData.dueDate || new Date().toISOString(),
      subtasks: aiData.subtasks || [],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleAIAddEvent = (aiData: Partial<Event>) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: aiData.title || 'New Event',
      date: aiData.date || new Date().toISOString(),
      startTime: aiData.startTime || '09:00',
      endTime: aiData.endTime || '10:00',
      location: aiData.location,
      description: aiData.description,
      tags: aiData.tags || [],
      category: aiData.category || 'General',
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleAIAddNote = (aiData: Partial<Note>) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: aiData.title || 'New Note',
      content: aiData.content || '',
      updatedAt: new Date().toISOString(),
      tags: aiData.tags || [],
      pinned: aiData.pinned || false,
      color: aiData.color,
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleAIAddFolder = (aiData: Partial<Category>) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
    const newFolder: Category = {
      id: Date.now().toString(),
      name: aiData.name || 'New Folder',
      color: aiData.color || colors[categories.length % colors.length],
    };
    setCategories(prev => [...prev, newFolder]);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            tasks={tasks} 
            setTasks={setTasks} 
            categories={categories} 
            setCategories={setCategories} 
            events={events}
            onOpenAI={() => setIsAIChatOpen(true)}
            onNavigate={(view) => setCurrentView(view)}
          />
        );
      case 'calendar':
        return <CalendarView tasks={tasks} events={events} setEvents={setEvents} toggleTask={(id) => {
          setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        }} />;
      case 'notes':
        return <Notes notes={notes} setNotes={setNotes} />;
      case 'focus':
        return <FocusTimer />;
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      default:
        return (
          <Dashboard 
            tasks={tasks} 
            setTasks={setTasks} 
            categories={categories} 
            setCategories={setCategories} 
            events={events} 
            onOpenAI={() => setIsAIChatOpen(true)}
            onNavigate={(view) => setCurrentView(view)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-neutral-50 shadow-xl relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <Auth onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full"
          >
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full"
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </main>

            <AnimatePresence>
              {isAIChatOpen && (
                <AIChat 
                  onClose={() => setIsAIChatOpen(false)}
                  onAddTask={handleAIAddTask}
                  onAddEvent={handleAIAddEvent}
                  onAddNote={handleAIAddNote}
                  onAddFolder={handleAIAddFolder}
                />
              )}
            </AnimatePresence>

            {/* Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-morphism h-20 px-4 flex items-center justify-between z-50">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Flow' },
                { id: 'calendar', icon: CalendarIcon, label: 'Chronos' },
                { id: 'focus', icon: Timer, label: 'Zen' },
                { id: 'notes', icon: NotebookPen, label: 'Vault' },
                { id: 'settings', icon: SettingsIcon, label: 'Pulse' },
              ].map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => setCurrentView(item.id as View)}
                    className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                      isActive ? 'text-neutral-900 font-medium' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${isActive ? 'fill-neutral-900/10' : ''}`} />
                    <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="w-1 h-1 rounded-full bg-neutral-900 absolute -bottom-1"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

