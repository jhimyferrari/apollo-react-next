"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const FONT_SCALE_STEPS = [90, 100, 110, 120, 130, 140] as const;
export type FontScale = (typeof FONT_SCALE_STEPS)[number];

const STORAGE_KEY = "apollo_accessibility_prefs";
const DEFAULT_FONT_SCALE: FontScale = 100;

interface AccessibilityPrefs {
  highContrast: boolean;
  fontScale: FontScale;
}

interface AccessibilityContextValue {
  highContrast: boolean;
  fontScale: FontScale;
  canIncreaseFont: boolean;
  canDecreaseFont: boolean;
  isCustomized: boolean;
  toggleHighContrast: () => void;
  setHighContrast: (enabled: boolean) => void;
  increaseFont: () => void;
  decreaseFont: () => void;
  setFontScale: (scale: FontScale) => void;
  resetFont: () => void;
  resetAll: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
);

function isValidFontScale(val: unknown): val is FontScale {
  return (
    typeof val === "number" &&
    (FONT_SCALE_STEPS as readonly number[]).includes(val)
  );
}

function readStoredPrefs(): AccessibilityPrefs {
  if (typeof window === "undefined") {
    return { highContrast: false, fontScale: DEFAULT_FONT_SCALE };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { highContrast: false, fontScale: DEFAULT_FONT_SCALE };
    }
    const parsed = JSON.parse(raw) as Partial<AccessibilityPrefs>;
    return {
      highContrast: Boolean(parsed.highContrast),
      fontScale: isValidFontScale(parsed.fontScale)
        ? parsed.fontScale
        : DEFAULT_FONT_SCALE,
    };
  } catch {
    return { highContrast: false, fontScale: DEFAULT_FONT_SCALE };
  }
}

function applyPrefsToDocument(prefs: AccessibilityPrefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Aplica ou remove classe de alto contraste
  if (prefs.highContrast) {
    root.classList.add("high-contrast");
    root.setAttribute("data-high-contrast", "true");
  } else {
    root.classList.remove("high-contrast");
    root.removeAttribute("data-high-contrast");
  }

  // Aplica escala de fonte no elemento raiz (html) e variável CSS proporcional
  const factor = prefs.fontScale / 100;
  root.style.fontSize = `${prefs.fontScale}%`;
  root.style.setProperty("--font-scale-factor", String(factor));
  root.setAttribute("data-font-scale", String(prefs.fontScale));
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(() =>
    readStoredPrefs()
  );

  // Sincroniza preferências com o DOM e localStorage
  useEffect(() => {
    applyPrefsToDocument(prefs);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignora erro de quota/storage bloqueado
    }
  }, [prefs]);

  const toggleHighContrast = useCallback(() => {
    setPrefs((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setPrefs((prev) => ({ ...prev, highContrast: enabled }));
  }, []);

  const setFontScale = useCallback((scale: FontScale) => {
    setPrefs((prev) => ({ ...prev, fontScale: scale }));
  }, []);

  const increaseFont = useCallback(() => {
    setPrefs((prev) => {
      const currentIndex = FONT_SCALE_STEPS.indexOf(prev.fontScale);
      const nextIndex = Math.min(
        currentIndex + 1,
        FONT_SCALE_STEPS.length - 1
      );
      return { ...prev, fontScale: FONT_SCALE_STEPS[nextIndex] };
    });
  }, []);

  const decreaseFont = useCallback(() => {
    setPrefs((prev) => {
      const currentIndex = FONT_SCALE_STEPS.indexOf(prev.fontScale);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return { ...prev, fontScale: FONT_SCALE_STEPS[prevIndex] };
    });
  }, []);

  const resetFont = useCallback(() => {
    setPrefs((prev) => ({ ...prev, fontScale: DEFAULT_FONT_SCALE }));
  }, []);

  const resetAll = useCallback(() => {
    setPrefs({ highContrast: false, fontScale: DEFAULT_FONT_SCALE });
  }, []);

  // Atalhos globais de teclado para acessibilidade:
  // Alt + Shift + C -> Alternar Autocontraste
  // Alt + Shift + + (ou =) -> Aumentar Fonte
  // Alt + Shift + - (ou _) -> Diminuir Fonte
  // Alt + Shift + 0 -> Restaurar Padrão
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || !e.shiftKey) return;

      const key = e.key.toLowerCase();
      if (key === "c") {
        e.preventDefault();
        toggleHighContrast();
      } else if (key === "+" || key === "=") {
        e.preventDefault();
        increaseFont();
      } else if (key === "-" || key === "_") {
        e.preventDefault();
        decreaseFont();
      } else if (key === "0") {
        e.preventDefault();
        resetAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleHighContrast, increaseFont, decreaseFont, resetAll]);

  const value = useMemo<AccessibilityContextValue>(() => {
    const currentIndex = FONT_SCALE_STEPS.indexOf(prefs.fontScale);
    return {
      highContrast: prefs.highContrast,
      fontScale: prefs.fontScale,
      canIncreaseFont: currentIndex < FONT_SCALE_STEPS.length - 1,
      canDecreaseFont: currentIndex > 0,
      isCustomized:
        prefs.highContrast || prefs.fontScale !== DEFAULT_FONT_SCALE,
      toggleHighContrast,
      setHighContrast,
      increaseFont,
      decreaseFont,
      setFontScale,
      resetFont,
      resetAll,
    };
  }, [
    prefs,
    toggleHighContrast,
    setHighContrast,
    increaseFont,
    decreaseFont,
    setFontScale,
    resetFont,
    resetAll,
  ]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility deve ser utilizado dentro de um AccessibilityProvider"
    );
  }
  return ctx;
}

