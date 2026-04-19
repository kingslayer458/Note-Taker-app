"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";

// ============================================
// Confetti Particles (Google Antigravity style)
// ============================================
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const colors = ["#6366f1", "#ec4899", "#f97316", "#22c55e", "#3b82f6", "#eab308", "#ef4444", "#8b5cf6"];

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      size: number; color: string;
      rotation: number; rotationSpeed: number;
      shape: "circle" | "square" | "line";
    };

    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create confetti particles
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        shape: (["circle", "square", "line"] as const)[Math.floor(Math.random() * 3)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "square") {
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        } else {
          ctx.fillRect(-p.size * 1.5, -1, p.size * 3, 2);
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ============================================
// Main Vault Overlay
// ============================================
export default function VaultOverlay({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    return <div className="h-screen w-full flex items-center justify-center bg-background text-foreground font-medium">Checking vault security...</div>;
  }

  // If authenticated, just render the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show the login screen
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-muted dark:bg-background text-foreground">
      {/* Confetti particles */}
      <ConfettiCanvas />

      {/* Content — sits above the canvas */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4">
        {/* Landing section */}
        <div className="text-center mb-8">
          {/* App Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
              <path d="M3 20h18" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">King Note</h1>
          <p className="text-muted-foreground text-sm">Your secure, personal note-taking companion.<br />Fast, private, and always in sync.</p>
        </div>

        {/* Login Card */}
        <div className="w-full p-8 bg-card border border-border rounded-xl shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-1">Unlock Vault</h2>
            <p className="text-muted-foreground text-sm">Enter your password to access your notes.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 pr-11 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>

            {error && <p className="text-destructive text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {isLoading ? "Unlocking..." : "Unlock Vault"}
            </button>
          </form>
        </div>

        {/* Footer */}
        {/* <p className="mt-6 text-xs text-muted-foreground/60">Beta</p> */}
      </div>
    </div>
  );
}
