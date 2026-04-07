import { useState } from "react";
import { Outlet } from "react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "../components/ui/sonner";
import { SplashScreen } from "./SplashScreen";

export function Root() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}