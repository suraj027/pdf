
import React, { useState, useEffect, useRef } from 'react';
import { PdfNote } from './types';
import { PLUS_ICON, PDF_ICON, GRID_VIEW_ICON, LIST_VIEW_ICON, ELLIPSIS_VERTICAL_ICON, CHEVRON_DOWN_ICON, APP_LOGO_ICON, OPEN_ICON, TRASH_ICON } from './constants';
import CreateNoteModal from './CreateNoteModal'; 

interface DashboardProps {
  notes: PdfNote[];
  onFileProvidedForNewNote: (file: File) => void; 
  onOpenNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

type ViewMode = 'grid' | 'list';

const cleanDisplayName = (name: string | null | undefined, defaultName: string = "Untitled Note"): string => {
  if (!name) return defaultName;
  let cleanedName = name.replace(/\s*\)\}\s*$/, ""); 
  cleanedName = cleanedName.replace(/\)\}\s*$/, "");   
  return cleanedName.trim() || defaultName;
};

const Dashboard: React.FC<DashboardProps> = ({ notes, onFileProvidedForNewNote, onOpenNote, onDeleteNote }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [openMenuNoteId, setOpenMenuNoteId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuNoteId && menuRefs.current[openMenuNoteId] && !menuRefs.current[openMenuNoteId]?.contains(event.target as Node)) {
        setOpenMenuNoteId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuNoteId]);

  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCreateModalOpen]);

  const sortedNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalFileSelect = (file: File) => {
    setIsCreateModalOpen(false);
    onFileProvidedForNewNote(file);
  };

  const NoteActionMenu: React.FC<{ note: PdfNote, positionClass?: string }> = ({ note, positionClass = "absolute right-2 top-10 mt-1" }) => {
    const displayName = cleanDisplayName(note.name, 'Untitled Note');
    return (
    <div
      ref={el => { menuRefs.current[note.id] = el; }}
      className={`${positionClass} w-40 bg-slate-700 rounded-md shadow-lg ring-1 ring-slate-600 z-20`}
    >
      <div className="py-1">
        <button
          onClick={() => { onOpenNote(note.id); setOpenMenuNoteId(null); }}
          className="flex items-center w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-600"
          aria-label={`Open note ${displayName}`}
        >
          {React.cloneElement(OPEN_ICON, {className: "w-4 h-4 mr-2 text-slate-300"})} Open
        </button>
        <button
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete the note "${displayName}"? This action cannot be undone.`)) {
              onDeleteNote(note.id);
            }
            setOpenMenuNoteId(null);
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-600 hover:text-red-300"
          aria-label={`Delete note ${displayName}`}
        >
          {React.cloneElement(TRASH_ICON, {className: "w-4 h-4 mr-2 text-red-400"})} Delete
        </button>
      </div>
    </div>
  )};

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {sortedNotes.map((note) => {
        const displayName = cleanDisplayName(note.name, 'Untitled Note');
        return (
        <div
          key={note.id}
          className="bg-slate-800 rounded-xl shadow-lg transition-all duration-300 hover:shadow-slate-700/50 flex flex-col p-4 sm:p-6 min-h-[160px] sm:min-h-[180px] relative"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 text-slate-500">{PDF_ICON}</div>
            <button
                onClick={() => setOpenMenuNoteId(openMenuNoteId === note.id ? null : note.id)}
                className="text-slate-400 hover:text-slate-100 p-1 -mr-1 -mt-1 rounded-full hover:bg-slate-700"
                aria-haspopup="true"
                aria-expanded={openMenuNoteId === note.id}
                aria-controls={`menu-${note.id}`}
                aria-label={`Options for note ${displayName}`}
            >
                {ELLIPSIS_VERTICAL_ICON}
            </button>
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold break-all text-md sm:text-lg text-slate-100 mb-1">
              {displayName}
            </h3>
            <p className="text-xs text-slate-400">
              {new Date(note.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              <span className="mx-1 text-slate-600">•</span>
              1 source
            </p>
          </div>
          {openMenuNoteId === note.id && <NoteActionMenu note={note} positionClass="absolute right-4 top-12" />}
        </div>
      )})}
    </div>
  );

  const renderListView = () => (
    <div className="bg-slate-800 rounded-lg shadow-lg">
      <div className="hidden sm:grid sm:grid-cols-[minmax(0,3fr)_repeat(3,minmax(0,1fr))_auto] gap-x-4 px-4 sm:px-6 py-3 border-b border-slate-700">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Title</div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center sm:text-left">Sources</div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center sm:text-left">Created</div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center sm:text-left">Role</div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider text-right sr-only">Actions</div>
      </div>
      <div className="divide-y divide-slate-700">
        {sortedNotes.map((note) => {
          const displayName = cleanDisplayName(note.name, 'Untitled Note');
          return (
          <div key={note.id} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,3fr)_repeat(3,minmax(0,1fr))_auto] gap-x-2 sm:gap-x-4 items-center px-3 py-3 sm:px-6 sm:py-4 hover:bg-slate-700/30 relative">
            {/* Mobile first: Title and actions, then expand for desktop */}
            <div className="flex items-center min-w-0 col-span-1 sm:col-auto">
              <div className="w-5 h-5 text-slate-500 mr-2 sm:mr-3 flex-shrink-0">{PDF_ICON}</div>
              <div className="flex-grow min-w-0">
                <span className="text-sm text-slate-100 truncate block" title={displayName}>
                  {displayName}
                </span>
                <div className="sm:hidden text-xs text-slate-400">
                   {new Date(note.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 1 source
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-sm text-slate-300 text-center sm:text-left">1 source</div>
            <div className="hidden sm:block text-sm text-slate-300 text-center sm:text-left">
              {new Date(note.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="hidden sm:block text-sm text-slate-300 text-center sm:text-left">Owner</div>
            <div className="relative flex justify-end col-span-1 sm:col-auto">
              <button
                onClick={() => setOpenMenuNoteId(openMenuNoteId === note.id ? null : note.id)}
                className="text-slate-400 hover:text-slate-100 p-1.5 rounded-full hover:bg-slate-600"
                aria-haspopup="true"
                aria-expanded={openMenuNoteId === note.id}
                aria-controls={`menu-${note.id}-list`}
                aria-label={`Options for note ${displayName}`}
              >
                {ELLIPSIS_VERTICAL_ICON}
              </button>
              {openMenuNoteId === note.id && <NoteActionMenu note={note} positionClass="absolute right-0 top-full mt-1.5" />}
            </div>
          </div>
        )})}
      </div>
    </div>
  );


  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col">
        <header className="mb-8 md:mb-10">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            {React.cloneElement(APP_LOGO_ICON, {className: "w-7 h-7 sm:w-8 sm:h-8"})}
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-200">OpenNotebook</h1>
          </div>
          {/* Removed "Welcome to OpenNotebook" heading */}
        </header>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          {/* Left Group: Create New + View Toggles */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition-colors sm:w-auto"
              aria-label="Create new note"
            >
              {PLUS_ICON} Create new
            </button>

            <div className="inline-flex items-center bg-slate-700 rounded-lg p-1 shadow">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-md ${viewMode === 'grid' ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-600/70 hover:text-slate-100'}`}
                  aria-pressed={viewMode === 'grid'}
                  aria-label="Switch to Grid view"
                >
                  {GRID_VIEW_ICON}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-md ${viewMode === 'list' ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-600/70 hover:text-slate-100'}`}
                  aria-pressed={viewMode === 'list'}
                  aria-label="Switch to List view"
                >
                  {LIST_VIEW_ICON}
                </button>
              </div>
          </div>

          {/* Right Group: Sort Dropdown */}
          <div className="relative">
            <button className="flex items-center justify-between w-full xs:w-auto px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 shadow">
              Most recent {CHEVRON_DOWN_ICON}
            </button>
          </div>
        </div>

        <main className="flex-grow">
          {sortedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <svg className="w-16 h-16 text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400 text-lg mt-2">
                You don't have any notes yet.
              </p>
              <p className="text-slate-500 text-sm">Click "Create new" to get started!</p>
            </div>
          ) : (
            viewMode === 'grid' ? renderGridView() : renderListView()
          )}
        </main>

        <footer className="mt-12 text-center text-sm text-slate-500 py-4 border-t border-slate-800">
          <p>&copy; {new Date().getFullYear()} OpenNotebook. Powered by Gemini & Google Cloud TTS.</p>
        </footer>
      </div>
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFileSelect={handleModalFileSelect}
      />
    </>
  );
};

export default Dashboard;