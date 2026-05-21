import { createContext, useContext, useState, useEffect } from "react";

const FONT = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

export const darkT = {
  bg0:     "#070C17",
  bg1:     "#0C1322",
  bg2:     "#111B2E",
  bg3:     "#1A2540",
  green:   "#22C55E",
  greenLt: "#4ADE80",
  greenBg: "rgba(34,197,94,0.08)",
  greenBd: "rgba(34,197,94,0.2)",
  amber:   "#F59E0B",
  amberBg: "rgba(245,158,11,0.08)",
  amberBd: "rgba(245,158,11,0.22)",
  red:     "#EF4444",
  redBg:   "rgba(239,68,68,0.08)",
  redBd:   "rgba(239,68,68,0.2)",
  border:  "rgba(255,255,255,0.06)",
  borderH: "rgba(255,255,255,0.12)",
  text1:   "#F1F5F9",
  text2:   "#94A3B8",
  text3:   "#475569",
  font:    FONT,
  isDark:  true,
};

export const lightT = {
  bg0:     "#F8FAFC",
  bg1:     "#FFFFFF",
  bg2:     "#F1F5F9",
  bg3:     "#E2E8F0",
  green:   "#16A34A",
  greenLt: "#22C55E",
  greenBg: "rgba(22,163,74,0.07)",
  greenBd: "rgba(22,163,74,0.18)",
  amber:   "#D97706",
  amberBg: "rgba(217,119,6,0.07)",
  amberBd: "rgba(217,119,6,0.18)",
  red:     "#DC2626",
  redBg:   "rgba(220,38,38,0.07)",
  redBd:   "rgba(220,38,38,0.15)",
  border:  "rgba(15,23,42,0.07)",
  borderH: "rgba(15,23,42,0.13)",
  text1:   "#0F172A",
  text2:   "#475569",
  text3:   "#94A3B8",
  font:    FONT,
  isDark:  false,
};

const ThemeContext = createContext({ T: darkT, toggle: () => {}, isDark: true });

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("halchal_theme") !== "light"; }
    catch { return true; }
  });

  useEffect(() => {
    const T = isDark ? darkT : lightT;
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    document.body.style.background = T.bg0;
    document.body.style.color      = T.text1;
    try { localStorage.setItem("halchal_theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  const toggle = () => setIsDark(d => !d);
  const T      = isDark ? darkT : lightT;

  return (
    <ThemeContext.Provider value={{ T, toggle, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme       = () => useContext(ThemeContext).T;
export const useThemeToggle = () => {
  const { toggle, isDark } = useContext(ThemeContext);
  return { toggle, isDark };
};
