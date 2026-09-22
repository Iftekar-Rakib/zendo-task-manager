import React, { useState } from 'react';
import { Search, Plus, MoreVertical, FileText, Clock, X, Trash2, Edit2, Pin, Tag, Palette, Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from '../types';

interface NotesProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const COLORS = [
  { name: 'Default', value: 'transparent' },
  { name: 'Black', value: '#171717' },
  { name: 'Red', value: '#FEE2E2' },
  { name: 'Green', value: '#DCFCE7' },
  { name: 'Yellow', value: '#FEF9C3' },
  { name: 'Purple', value: '#F3E8FF' },
];

export default function Notes({ notes, setNotes }: NotesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    pinned: false,
    color: 'transparent'
  });

  const [tagInput, setTagInput] = useState('');

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || n.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    if (a.pinned === b.pinned) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return a.pinned ? -1 : 1;
  });

  const handleAddNote = () => {
    setActiveNote(null);
    setNoteForm({ 
      title: '', 
      content: '', 
      tags: [], 
      pinned: false, 
      color: 'transparent' 
    });
    setIsEditing(true);
  };

  const handleEditNote = (note: Note) => {
    setActiveNote(note);
    setNoteForm({ 
      title: note.title, 
      content: note.content,
      tags: note.tags || [],
      pinned: note.pinned || false,
      color: note.color || 'transparent'
    });
    setIsEditing(true);
  };

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const saveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;

    if (activeNote) {
      setNotes(prev => prev.map(n => 
        n.id === activeNote.id 
          ? { ...n, ...noteForm, updatedAt: new Date().toISOString() } 
          : n
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteForm,
        updatedAt: new Date().toISOString()
      };
      setNotes(prev => [newNote, ...prev]);
    }
    setIsEditing(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !noteForm.tags.includes(tagInput.trim())) {
      setNoteForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNoteForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  return (
    <div className="p-6 pb-32">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-display font-bold text-neutral-900 italic">Vault</h1>
          <button 
            onClick={handleAddNote}
            className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        {/* Search & Tags */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Explore your thoughts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-100 rounded-2xl py-4 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-200 transition-all border border-transparent focus:bg-white"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${
                !selectedTag ? 'bg-neutral-900 text-white shadow-md' : 'bg-white border border-neutral-100 text-neutral-400 hover:border-neutral-200'
              }`}
            >
              All Signals
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${
                  selectedTag === tag ? 'bg-neutral-900 text-white shadow-md' : 'bg-white border border-neutral-100 text-neutral-400 hover:border-neutral-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Note Grid - Masonry style with columns */}
      <div className="columns-1 gap-4 space-y-4">
        {filteredNotes.length === 0 && (
          <div className="text-center py-20 opacity-20 flex flex-col items-center col-span-full">
            <FileText className="w-16 h-16 mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest leading-loose">
              {searchTerm || selectedTag ? 'No matching signals found' : 'The vault is empty\nCapture a spark'}
            </p>
          </div>
        )}

        {filteredNotes.map((note) => {
          const isDark = note.color === '#171717';
          return (
            <motion.div
              layout
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleEditNote(note)}
              style={{ backgroundColor: note.color !== 'transparent' ? note.color : undefined }}
              className={`break-inside-avoid w-full p-6 rounded-[2.5rem] border border-neutral-100 card-shadow relative overflow-hidden group cursor-pointer hover:border-neutral-200 transition-all ${
                note.color === 'transparent' ? 'bg-white' : ''
              } ${isDark ? 'border-neutral-800' : ''}`}
            >
              {/* Header Action icons */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex space-x-2">
                  <div className={`p-2 bg-white/10 backdrop-blur-sm rounded-xl transition-all`}>
                    <FileText className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-400' : note.color === 'transparent' ? 'text-neutral-500' : 'text-neutral-600'}`} />
                  </div>
                  {note.pinned && (
                    <Pin className={`w-3.5 h-3.5 ${isDark ? 'text-white fill-white' : 'text-neutral-900 fill-neutral-900'}`} />
                  )}
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={(e) => togglePin(e, note.id)}
                    className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'}`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${note.pinned ? (isDark ? 'fill-white' : 'fill-neutral-900') : ''}`} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this note?')) setNotes(prev => prev.filter(n => n.id !== note.id));
                    }}
                    className={`p-1.5 hover:bg-red-500/10 rounded-lg transition-colors ${isDark ? 'text-neutral-500 hover:text-red-400' : 'text-neutral-400 hover:text-red-500'}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <h3 className={`text-lg font-bold font-display mb-2 tracking-tight group-hover:translate-x-1 transition-transform ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {note.title}
              </h3>
              <p className={`text-xs line-clamp-6 leading-relaxed mb-6 font-medium whitespace-pre-wrap ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {note.content}
              </p>

              <div className="space-y-4">
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.map(tag => (
                      <span key={tag} className={`text-[8px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 border rounded-full ${
                        isDark 
                          ? 'bg-white/5 border-white/10 text-neutral-500' 
                          : 'bg-white/30 border-neutral-900/5 text-neutral-500'
                      }`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className={`flex items-center space-x-2 text-[9px] uppercase font-mono tracking-widest pt-4 border-t ${isDark ? 'text-neutral-600 border-white/5' : 'text-neutral-400 border-neutral-900/5'}`}>
                  <Clock className="w-3 h-3" />
                  <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Note Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[80] flex items-end justify-center sm:items-center p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden card-shadow flex flex-col max-h-[95vh]"
            >
              <div 
                className="p-8 pb-4 transition-colors duration-500"
                style={{ backgroundColor: noteForm.color !== 'transparent' ? noteForm.color : undefined }}
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className={`text-2xl font-bold font-display italic ${noteForm.color === '#171717' ? 'text-white' : 'text-neutral-900'}`}>
                      {activeNote ? 'Refine Entry' : 'New Thought'}
                    </h2>
                    <p className={`text-[10px] mt-1 uppercase tracking-widest font-mono ${noteForm.color === '#171717' ? 'text-neutral-500' : 'text-neutral-600'}`}>
                      Registry v{activeNote ? '2.0.4' : '1.0.1'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setNoteForm(prev => ({ ...prev, pinned: !prev.pinned }))}
                      className={`p-2.5 rounded-full transition-all ${noteForm.pinned ? 'bg-neutral-900 text-white' : 'bg-white/50 text-neutral-400'}`}
                    >
                      <Pin className={`w-5 h-5 ${noteForm.pinned ? 'fill-white' : ''}`} />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="p-2.5 bg-white/50 rounded-full text-neutral-500 hover:text-neutral-700 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <input
                  autoFocus
                  type="text"
                  placeholder="Focus point..."
                  value={noteForm.title}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full text-2xl font-bold focus:outline-none bg-transparent placeholder-neutral-400 ${noteForm.color === '#171717' ? 'text-white' : 'text-neutral-900'}`}
                />
              </div>

              <div className="p-8 pt-4 space-y-6 flex-1 overflow-y-auto no-scrollbar">
                <textarea
                  placeholder="Pour your mind here..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full min-h-[200px] text-sm bg-transparent border-none focus:ring-0 resize-none focus:outline-none text-neutral-600 leading-relaxed placeholder-neutral-300"
                />

                {/* Customization Tools */}
                <div className="space-y-6 pt-6 border-t border-neutral-50">
                  {/* Color Picker */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-neutral-400">
                      <Palette className="w-3.5 h-3.5" />
                      <label className="text-[10px] uppercase font-mono tracking-widest font-bold">Atmosphere</label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => setNoteForm(prev => ({ ...prev, color: c.value }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-90 ${
                            noteForm.color === c.value ? 'border-neutral-900 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.value === 'transparent' ? '#F3F4F6' : c.value }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tag Editor */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-neutral-400">
                      <Tag className="w-3.5 h-3.5" />
                      <label className="text-[10px] uppercase font-mono tracking-widest font-bold">Metadata Signals</label>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {noteForm.tags.map(tag => (
                        <span 
                          key={tag} 
                          onClick={() => removeTag(tag)}
                          className="flex items-center px-3 py-1 bg-neutral-100 rounded-full text-[10px] font-mono text-neutral-600 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors group"
                        >
                          #{tag}
                          <X className="w-2.5 h-2.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add signal..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-3 pl-4 pr-10 text-xs focus:outline-none focus:border-neutral-200"
                      />
                      <button 
                        onClick={(e) => { e.preventDefault(); addTag(); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-900"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={saveNote}
                  className="w-full bg-neutral-900 text-white rounded-[2rem] py-5 font-bold text-lg hover:bg-black transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center space-x-2"
                >
                  <span>Commit Thought</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
