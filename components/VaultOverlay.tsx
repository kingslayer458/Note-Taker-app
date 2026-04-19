"use client";

import { useState, useEffect } from "react";

export default function VaultOverlay({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we are already authenticated
    fetch("/api/auth/check")
      .then(res => {
        if (res.ok) setIsAuthenticated(true);
        else setIsAuthenticated(false);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setError("Incorrect password. The vault remains locked.");
      }
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // While checking status, show nothing or a tiny spinner
  if (isAuthenticated === null) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white font-medium">Checking vault security...</div>;
  }

  // If authenticated, just render the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show the login screen
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950 text-white">
      <div className="max-w-md w-full p-8 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Personal Vault</h1>
          <p className="text-gray-400">Enter your password to access your notes.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            {isLoading ? "Unlocking..." : "Unlock Vault"}
          </button>
        </form>
      </div>
    </div>
  );
}
