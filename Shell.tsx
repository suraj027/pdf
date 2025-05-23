
import React, { useState, useEffect, useCallback } from 'react';
import App from './App'; // Your existing PDF processing component
import Dashboard from './Dashboard';
import { PdfNote } from './types';
import { getNotes, addNote, updateNote, deleteNote, getNoteById } from './services/localStorageService';

const Shell: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState<PdfNote[]>([]);
  const [editingNote, setEditingNote] = useState<PdfNote | null>(null);
  const [pendingFileForNewNote, setPendingFileForNewNote] = useState<File | null>(null);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const refreshNotes = useCallback(() => {
    setNotes(getNotes());
  }, []);

  const handleFileProvidedForNewNote = (file: File) => {
    setPendingFileForNewNote(file);
    setEditingNote(null); // Clear any existing editing note
    setActiveNoteId(null);
    setCurrentView('editor');
  };
  
  const handleInitialFileProcessed = () => {
    setPendingFileForNewNote(null);
  };

  const handleOpenNote = (noteId: string) => {
    const noteToOpen = getNoteById(noteId);
    if (noteToOpen) {
      setEditingNote(noteToOpen);
      setActiveNoteId(noteId);
      setPendingFileForNewNote(null); // Clear any pending file if opening existing note
      setCurrentView('editor');
    } else {
      console.error("Could not find note with ID:", noteId);
      setCurrentView('dashboard'); // Fallback to dashboard
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (deleteNote(noteId)) {
      refreshNotes();
      if (activeNoteId === noteId) { // If deleting the currently open note
        setActiveNoteId(null);
        setEditingNote(null);
        setPendingFileForNewNote(null);
        setCurrentView('dashboard');
      }
    }
  };

  const handleBackToDashboard = () => {
    setActiveNoteId(null);
    setEditingNote(null);
    setPendingFileForNewNote(null);
    setCurrentView('dashboard');
  };

  const handleNoteProcessed = (processedData: {
    pdfName: string; 
    pdfText: string;
    summary: string | null;
    podcastScript?: string | null;
  }) => {
    if (!processedData.pdfName || !processedData.pdfText) {
        console.warn("Note processing called with insufficient data (missing pdfName or pdfText), not saving.");
        return;
    }

    if (editingNote && activeNoteId) { // Updating an existing note
      const updated: PdfNote = {
        ...editingNote,
        name: processedData.pdfName, 
        pdfText: processedData.pdfText, 
        summary: processedData.summary,
        podcastScript: processedData.podcastScript !== undefined ? processedData.podcastScript : editingNote.podcastScript,
        timestamp: Date.now(), 
      };
      if (updateNote(updated)) {
        setEditingNote(updated); 
      }
    } else { // Creating a new note (likely from pendingFileForNewNote)
      const newNoteData: Omit<PdfNote, 'id' | 'timestamp'> = {
        name: processedData.pdfName, 
        pdfText: processedData.pdfText, 
        summary: processedData.summary,
        podcastScript: processedData.podcastScript,
      };
      const newCreatedNote = addNote(newNoteData);
      setEditingNote(newCreatedNote); 
      setActiveNoteId(newCreatedNote.id);
    }
    refreshNotes(); 
  };


  if (currentView === 'editor') {
    return (
      <App
        key={activeNoteId || pendingFileForNewNote?.name || 'new-note-editor'} 
        initialNote={editingNote}
        initialFile={pendingFileForNewNote}
        onInitialFileProcessed={handleInitialFileProcessed}
        onNoteProcessed={handleNoteProcessed}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  return (
    <Dashboard
      notes={notes}
      onFileProvidedForNewNote={handleFileProvidedForNewNote} // Use the new handler
      onOpenNote={handleOpenNote}
      onDeleteNote={handleDeleteNote}
    />
  );
};

export default Shell;
