import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Theme, Language } from "@/types"
import i18n from "@/i18n"

interface SettingsState {
  theme: Theme
  language: Language
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLanguage: (lang: Language) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "light",
      language: "en",
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light"
        set({ theme: next })
        applyTheme(next)
      },
      setLanguage: (lang) => {
        set({ language: lang })
        i18n.changeLanguage(lang)
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
      },
    }),
    { name: "cash-tracker-settings" }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

export function initSettings() {
  const stored = localStorage.getItem("cash-tracker-settings")
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      const state = parsed.state
      if (state?.theme) applyTheme(state.theme)
      if (state?.language) {
        i18n.changeLanguage(state.language)
        document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr"
      }
    } catch {
      // ignore
    }
  }
}
