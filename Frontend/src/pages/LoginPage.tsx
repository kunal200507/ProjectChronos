import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import chronosLogo from "@/assets/chronos-logo-horizontal.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    // Simulate a brief auth delay for realism
    setTimeout(() => {
      setIsLoading(false);
      navigate("/demo");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-landing flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* Back to home */}
      <div className="w-full max-w-md mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Login Card */}
      <div
        className="w-full max-w-md glass-card glow-border rounded-2xl p-8 animate-fade-in"
        style={{ animation: "fadeInUp 0.45s ease both" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={chronosLogo} alt="Chronos ICU" className="h-9 mb-4" />
          <h1 className="text-xl font-semibold text-sidebar-foreground text-center">
            Sign in to{" "}
            <span className="text-gradient-brand font-bold">Chronos ICU</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            AI-powered early warning system for ICUs
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-6">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-medium">Demo mode:</span> Enter
            any email and password to access the dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-sidebar-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-landing-surface border border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-sidebar-foreground"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-lg bg-landing-surface border border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Forgot password (cosmetic) */}
          <div className="flex justify-end -mt-2">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        © 2026 Chronos ICU — Team Pixel Pioneer
      </p>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
