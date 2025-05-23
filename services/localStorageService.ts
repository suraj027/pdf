
import { PdfNote } from '../types';

const NOTES_STORAGE_KEY = 'openNotebook_notes';

export const getNotes = (): PdfNote[] => {
  try {
    const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error("Error reading notes from localStorage:", error);
    return [];
  }
};

export const getNoteById = (id: string): PdfNote | undefined => {
  const notes = getNotes();
  return notes.find(note => note.id === id);
};

export const addNote = (note: Omit<PdfNote, 'id' | 'timestamp'>): PdfNote => {
  const notes = getNotes();
  const newNote: PdfNote = {
    ...note,
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
  };
  notes.push(newNote);
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Error saving note to localStorage:", error);
    // Potentially handle quota exceeded error
  }
  return newNote;
};

export const updateNote = (updatedNote: PdfNote): PdfNote | null => {
  let notes = getNotes();
  const noteIndex = notes.findIndex(note => note.id === updatedNote.id);
  if (noteIndex > -1) {
    notes[noteIndex] = updatedNote;
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      return updatedNote;
    } catch (error) {
      console.error("Error updating note in localStorage:", error);
      return null;
    }
  }
  console.warn(`UpdateNote: Note with id ${updatedNote.id} not found.`);
  return null;
};

export const deleteNote = (id: string): boolean => {
  let notes = getNotes();
  const initialLength = notes.length;
  notes = notes.filter(note => note.id !== id);
  if (notes.length < initialLength) {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      return true;
    } catch (error) {
      console.error("Error deleting note from localStorage:", error);
      return false;
    }
  }
  return false;
};