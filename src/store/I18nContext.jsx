import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ptBR from '../i18n/pt-BR.json';
import en from '../i18n/en.json';

const LANG_KEY = 'nexora.lang.v1';
const DICTS = { 'pt-BR': ptBR, en };
export const SUPPORTED_LANGS = ['pt-BR', 'en'];

const I18nContext = createContext(null);

function readLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  } catch {/* ignore */}
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'pt-BR';
  return nav && nav.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readLang);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!SUPPORTED_LANGS.includes(next)) return;
    setLangState(next);
    try { localStorage.setItem(LANG_KEY, next); } catch {/* ignore */}
  }, []);

  const t = useCallback((key, vars) => {
    const dict = DICTS[lang] || DICTS['pt-BR'];
    let value = getByPath(dict, key);
    if (value == null) value = getByPath(DICTS.en, key);
    if (value == null) return key;
    if (typeof value === 'string' && vars) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? `{{${k}}}`));
    }
    return value;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, supported: SUPPORTED_LANGS }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
