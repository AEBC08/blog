export type ThemeMode = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

export interface UseThemeReturn {
  mode: Ref<ThemeMode>
  isDark: Ref<boolean>
  setMode: (next: ThemeMode) => void
}

const MODE_STORAGE_KEY = 'theme-mode'
const LEGACY_STORAGE_KEY = 'theme'

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'system') {
    return systemPrefersDark()
      ? 'dark'
      : 'light'
  }

  return mode
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('m-theme-dark', theme === 'dark')
}

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY)

    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      return stored
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)

    if (legacy === 'light' || legacy === 'dark') {
      return legacy
    }
  }
  catch {
    // Private browsing can block storage; fall back to the system preference.
  }

  return 'system'
}

function persistMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode)
  }
  catch {
    // The class change still applies when storage is unavailable.
  }
}

/**
 * Colour mode is driven by CSS classes so the inline head script can set it
 * before hydration. This composable reads that state, exposes the three-way
 * selection, and keeps the OS preference listener alive while in system mode.
 */
export function useTheme(): UseThemeReturn {
  const mode = useState<ThemeMode>('theme-mode', () => 'system')
  const isDark = useState<boolean>('theme-is-dark', () => false)
  // Mermaid cannot read our class-based mode, so keep its manual override in sync.
  const { setMermaidTheme } = useMermaidTheme()

  let mediaQuery: MediaQueryList | null = null

  function sync(theme: Theme): void {
    isDark.value = theme === 'dark'
    setMermaidTheme(theme)
  }

  function onSystemChange(event: MediaQueryListEvent): void {
    if (mode.value !== 'system') {
      return
    }

    const theme: Theme = event.matches ? 'dark' : 'light'
    applyTheme(theme)
    sync(theme)
  }

  function setMode(next: ThemeMode): void {
    mode.value = next
    document.documentElement.dataset.themeMode = next
    persistMode(next)

    const theme = resolveTheme(next)
    applyTheme(theme)
    sync(theme)
  }

  onMounted(() => {
    const stored = readStoredMode()
    mode.value = stored
    document.documentElement.dataset.themeMode = stored

    const theme = resolveTheme(stored)
    applyTheme(theme)
    sync(theme)

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', onSystemChange)
  })

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', onSystemChange)
    mediaQuery = null
  })

  return { mode, isDark, setMode }
}
