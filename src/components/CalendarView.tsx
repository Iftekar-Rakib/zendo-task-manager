import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, MapPin, Plus, X, Tag, Calendar as CalendarIcon } from 'lucide-react';
import { Task, Event } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  toggleTask: (id: string) => void;
}

export default function CalendarView({ tasks, events, setEvents, toggleTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  const [eventForm, setEventForm] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
    tags: [] as string[],
    newTag: '',
    category: 'General',
  });

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getTasksForDate = (day: number) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      return (
        d.getDate() === day &&
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const getEventsForDate = (day: number) => {
    return events.filter(event => {
      const d = new Date(event.date);
      return (
        d.getDate() === day &&
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventForm.title,
      date: selectedDate.toISOString(),
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      location: eventForm.location,
      description: eventForm.description,
      tags: eventForm.tags,
      category: eventForm.category,
    };

    setEvents(prev => [...prev, newEvent]);
    setEventForm({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      description: '',
      tags: [],
      newTag: '',
      category: 'General',
    });
    setIsAddingEvent(false);
  };

  const addTag = () => {
    if (eventForm.newTag.trim() && !eventForm.tags.includes(eventForm.newTag.trim())) {
      setEventForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEventForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const weeks = [];
  let days = [];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Fill empty slots
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-12 w-full" />);
  }

  // Fill days
  for (let d = 1; d <= totalDays; d++) {
    const hasTasks = getTasksForDate(d).length > 0;
    const hasEvents = getEventsForDate(d).length > 0;
    days.push(
      <button
        key={d}
        onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d))}
        className="h-12 w-full flex flex-col items-center justify-center relative group"
      >
        <div className={`
          w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all
          ${isSelected(d) ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-700 hover:bg-neutral-100'}
          ${isToday(d) && !isSelected(d) ? 'border border-neutral-900' : ''}
        `}>
          {d}
        </div>
        {(hasTasks || hasEvents) && !isSelected(d) && (
          <div className="absolute bottom-1 flex space-x-0.5">
            {hasTasks && <div className="w-1 h-1 bg-neutral-400 rounded-full" />}
            {hasEvents && <div className="w-1 h-1 bg-neutral-900 rounded-full" />}
          </div>
        )}
      </button>
    );

    if (days.length === 7) {
      weeks.push(<div key={`week-${weeks.length}`} className="flex justify-between">{days}</div>);
      days = [];
    }
  }
  if (days.length > 0) {
    while (days.length < 7) {
      days.push(<div key={`empty-end-${days.length}`} className="h-12 w-full" />);
    }
    weeks.push(<div key={`week-${weeks.length}`} className="flex justify-between">{days}</div>);
  }

  const selectedTasks = getTasksForDate(selectedDate.getDate());
  const selectedEvents = getEventsForDate(selectedDate.getDate());

  return (
    <div className="p-6 pb-32">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-display font-medium text-neutral-900 leading-tight">
          {monthName} <span className="font-light italic text-neutral-400">{year}</span>
        </h1>
        <div className="flex space-x-2">
          <button onClick={() => setIsAddingEvent(true)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors border border-neutral-100 mr-2">
            <Plus className="w-5 h-5 text-neutral-900" />
          </button>
          <button onClick={handlePrevMonth} className="p-2 hover:bg-neutral-100 rounded-full transition-colors border border-neutral-100">
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-neutral-100 rounded-full transition-colors border border-neutral-100">
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-neutral-100 card-shadow mb-8">
        <div className="flex justify-between mb-4">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="w-full text-center text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {weeks}
        </div>
      </div>

      {/* Events & Tasks for selected day */}
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-2xl font-bold font-display italic">Timeline</h2>
          <span className="text-[10px] items-center space-x-2 text-neutral-500 font-mono tracking-widest bg-neutral-100 px-4 py-1.5 rounded-full border border-neutral-200 shadow-sm text-center">
            {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Events Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-2 px-1">
            <div className="w-1 h-3 bg-neutral-900 rounded-full" />
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-neutral-400">Events</span>
          </div>
          {selectedEvents.length === 0 ? (
            <div className="p-8 rounded-[2rem] border border-dashed border-neutral-200 bg-neutral-50/30 text-center">
              <p className="text-[10px] text-neutral-300 uppercase tracking-widest font-mono italic">Void of occurrences</p>
            </div>
          ) : (
            selectedEvents.map(event => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={event.id}
                className="bg-neutral-900 text-white p-5 rounded-[2rem] card-shadow-lg flex flex-col space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg font-display tracking-tight">{event.title}</h3>
                    <div className="flex items-center space-x-3 mt-1.5 opacity-60">
                      <div className="flex items-center text-[10px] space-x-1.5 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-[10px] space-x-1.5 font-mono">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                {event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map(tag => (
                      <span key={tag} className="text-[8px] uppercase tracking-widest font-mono text-neutral-400">#{tag}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Tasks Section */}
        <div className="space-y-4 pb-12">
          <div className="flex items-center space-x-3 mb-2 px-1">
            <div className="w-1 h-3 bg-neutral-300 rounded-full" />
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-neutral-400">Objectives</span>
          </div>
          {selectedTasks.length === 0 ? (
            <div className="text-center py-12 rounded-[2rem] border border-dashed border-neutral-200 bg-neutral-50/50">
              <p className="text-[10px] text-neutral-300 uppercase tracking-widest font-mono italic">No objectives</p>
            </div>
          ) : (
            selectedTasks.map((task) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[9px] text-neutral-400 uppercase font-mono tracking-widest">{task.category}</span>
                      {task.priority === 'high' && (
                        <span className="w-1 h-1 rounded-full bg-red-400" />
                      )}
                    </div>
                  </div>
                </div>

                {task.subtasks && task.subtasks.length > 0 && !task.completed && (
                  <div className="pl-9 space-y-1.5 pb-1">
                    {task.subtasks.map(sub => (
                       <div key={sub.id} className="flex items-center space-x-2">
                        {sub.completed ? (
                          <CheckCircle2 className="w-3 h-3 text-neutral-900" />
                        ) : (
                          <Circle className="w-3 h-3 text-neutral-300" />
                        )}
                        <span className={`text-[10px] ${sub.completed ? 'line-through text-neutral-400' : 'text-neutral-600'}`}>{sub.title}</span>
                       </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Event Creator Modal */}
      <AnimatePresence>
        {isAddingEvent && (
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
                  <h2 className="text-2xl font-bold font-display italic">Chronos Event</h2>
                  <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-mono">Map the moment</p>
                </div>
                <button onClick={() => setIsAddingEvent(false)} className="p-2 bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Event Name</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="What's happening?"
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full text-xl font-medium focus:outline-none bg-neutral-50 rounded-2xl p-4 border border-transparent focus:border-neutral-200 transition-all shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Start Time</label>
                      <input
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full bg-neutral-50 rounded-2xl p-4 text-xs font-medium border border-transparent focus:border-neutral-200 transition-all focus:outline-none shadow-inner"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">End Time</label>
                      <input
                        type="time"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full bg-neutral-50 rounded-2xl p-4 text-xs font-medium border border-transparent focus:border-neutral-200 transition-all focus:outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Where is this taking place?"
                        value={eventForm.location}
                        onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-neutral-50 rounded-2xl p-4 pl-12 text-sm border border-transparent focus:border-neutral-200 transition-all focus:outline-none shadow-inner"
                      />
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Description</label>
                    <textarea
                      placeholder="Add event details..."
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full min-h-[80px] text-sm bg-neutral-50 rounded-2xl p-4 border border-transparent focus:border-neutral-200 transition-all resize-none focus:outline-none text-neutral-600 shadow-inner"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Tags</label>
                    <div className="bg-neutral-50 rounded-2xl p-4 border border-transparent focus-within:border-neutral-200 transition-all shadow-inner">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {eventForm.tags.map(tag => (
                          <span key={tag} className="flex items-center space-x-1 px-2 py-0.5 bg-white rounded text-[8px] font-bold text-neutral-500 border border-neutral-100 uppercase tracking-widest">
                            <span>{tag}</span>
                            <button type="button" onClick={() => removeTag(tag)} className="text-neutral-300 hover:text-red-400">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add tag..."
                        value={eventForm.newTag}
                        onChange={(e) => setEventForm(prev => ({ ...prev, newTag: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="w-full bg-transparent text-[10px] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-neutral-900 text-white rounded-[2rem] py-5 font-bold text-lg hover:bg-black transition-all active:scale-[0.98] shadow-2xl shadow-neutral-900/20 flex items-center justify-center space-x-2"
                >
                  <span>Commit Event</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
