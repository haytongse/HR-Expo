import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { translations, LangCode } from './translations'

const STORAGE_KEY = '@app_language'

type LanguageContextValue = {
  language: LangCode
  setLanguage: (lang: LangCode) => void
  t: (key: keyof typeof translations.en, ...args: any[]) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => String(key),
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<LangCode>('en')

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(val => { if (val === 'en' || val === 'kh') setLangState(val) })
      .catch(() => {})
  }, [])

  const setLanguage = useCallback((lang: LangCode) => {
    setLangState(lang)
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {})
  }, [])

  const t = useCallback(
    (key: keyof typeof translations.en, ...args: any[]): string => {
      const val = translations[language][key]
      if (typeof val === 'function') return (val as Function)(...args)
      return String(val ?? key)
    },
    [language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
