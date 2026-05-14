import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const NOTES_KEY = 'nexora.devices.notes.v1';
const NotesContext = createContext(null);

function readNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState(readNotes);

  useEffect(() => {
    try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {/* ignore */}
  }, [notes]);

  const get = useCallback((deviceId) => notes[String(deviceId)] || '', [notes]);
  const set = useCallback((deviceId, text) => {
    setNotes((prev) => ({ ...prev, [String(deviceId)]: text }));
  }, []);
  const clearAll = useCallback(() => setNotes({}), []);

  const value = useMemo(() => ({ get, set, clearAll, all: notes }), [get, set, clearAll, notes]);
  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
