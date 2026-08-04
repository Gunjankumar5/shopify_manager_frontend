import { useEffect, useMemo, useState } from "react";
import { Ico, Spin } from "../components/Icons";
import { hasSupabaseConfig, supabase } from "../lib/supabaseClient";

const FEATURE_CARDS = [
  {
    title: "Secure access",
    text: "Email/password authentication with session persistence and auto-refresh.",
    icon: "lock",
  },
  {
    title: "Team ready",
    text: "Role-based onboarding for admins, managers, and junior users.",
    icon: "users",
  },
  {
    title: "Store aware",
    text: "Connected stores and permissions stay scoped to the logged-in account.",
    icon: "check",
  },
];

const TRUST_POINTS = [
  "Session handled by Supabase Auth",
  "Connected stores stay user-scoped",
  "Fast role-based access on sign-in",
];

export default function LoginPage() {
  const [isCompact, setIsCompact] = useState(() => window.innerWidth <= 980);
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const trimmedEmail = email.trim();
  const submitLabel = mode === "signin" ? "Sign in" : "Create account";
  const isLocked = cooldownSeconds > 0;

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      letter: /[A-Za-z]/.test(password),
      number: /\d/.test(password),
    }),
    [password],
  );

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth <= 980);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownSeconds(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil(cooldownUntil - Date.now() / 1000),
      );
      setCooldownSeconds(remaining);
      if (remaining === 0) {
        setCooldownUntil(0);
        setFailedAttempts(0);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [cooldownUntil]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
    setShowPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${cooldownSeconds}s and try again.`);
      return;
    }

    if (!hasSupabaseConfig || !supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    if (!trimmedEmail || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (
      mode === "signup" &&
      (!passwordChecks.length || !passwordChecks.letter || !passwordChecks.number)
    ) {
      setError("Use a stronger password: 8+ chars with letters and numbers.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage("Account created. Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
      setFailedAttempts(0);
    } catch (e) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setCooldownUntil(Math.floor(Date.now() / 1000) + 30);
        setError("Too many failed attempts. Please wait 30s before trying again.");
      } else {
        setError(e?.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const modeTitle = mode === "signin" ? "Welcome back" : "Create your workspace";
  const modeSubtitle =
    mode === "signin"
      ? "Sign in to manage products, inventory, and connected stores from one place."
      : "Create an account to access the dashboard with role-based onboarding.";

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at top left, rgba(99,102,241,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(16,185,129,0.12), transparent 28%), linear-gradient(135deg, #05060a 0%, #0b1020 48%, #090b10 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.2))",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "min(1180px, 100%)",
          display: "grid",
          gridTemplateColumns: isCompact
            ? "1fr"
            : "minmax(0, 1.08fr) minmax(430px, 0.92fr)",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        <aside
          style={{
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(16,18,28,0.92), rgba(9,10,16,0.96))",
            boxShadow: "0 30px 90px rgba(0,0,0,0.45)",
            backdropFilter: "blur(18px)",
            padding: "clamp(24px, 4vw, 36px)",
            display: "grid",
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(99,102,241,0.18)",
                background: "rgba(99,102,241,0.12)",
                color: "#c7d2fe",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <Ico n="lock" size={14} color="currentColor" />
              Secure multi-store access
            </div>

            <h1
              style={{
                marginTop: 18,
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.1rem, 4.4vw, 4rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
                maxWidth: 680,
              }}
            >
              Professional access for Shopify operations.
            </h1>

            <p
              style={{
                marginTop: 16,
                maxWidth: 620,
                color: "var(--text-secondary)",
                fontSize: "clamp(0.98rem, 1.3vw, 1.08rem)",
                lineHeight: 1.65,
              }}
            >
              Sign in to manage products, inventory, collections, and connected
              stores with a clean role-aware dashboard designed for daily team
              use.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isCompact ? "1fr" : "repeat(3, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {FEATURE_CARDS.map((item) => (
              <div
                key={item.title}
                style={{
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  padding: 18,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 14,
                    background:
                      item.icon === "lock"
                        ? "rgba(99,102,241,0.16)"
                        : item.icon === "users"
                          ? "rgba(16,185,129,0.14)"
                          : "rgba(245,158,11,0.14)",
                    color:
                      item.icon === "lock"
                        ? "#c7d2fe"
                        : item.icon === "users"
                          ? "#a7f3d0"
                          : "#fde68a",
                  }}
                >
                  <Ico n={item.icon} size={18} color="currentColor" />
                </div>
                <div style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  {item.title}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {TRUST_POINTS.map((point) => (
                <span
                  key={point}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--text-secondary)",
                    fontSize: 12,
                  }}
                >
                  <Ico n="check" size={14} color="var(--success)" />
                  {point}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <section
          style={{
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(180deg, rgba(22,24,34,0.96), rgba(13,15,22,0.98))",
            boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
            backdropFilter: "blur(18px)",
            padding: "clamp(24px, 4vw, 36px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-secondary)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <Ico n="shield" size={13} color="currentColor" />
                Account access
              </div>
              <h2
                style={{
                  marginTop: 14,
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                  letterSpacing: "-0.04em",
                }}
              >
                {modeTitle}
              </h2>
              <p
                style={{
                  marginTop: 8,
                  color: "var(--text-secondary)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  maxWidth: 520,
                }}
              >
                {modeSubtitle}
              </p>
            </div>

            <div
              style={{
                display: isCompact ? "none" : "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
                fontSize: 12,
              }}
            >
              <Ico n="clock" size={14} color="var(--success)" />
              Sessions persist across reloads
            </div>
          </div>

          {!hasSupabaseConfig && (
            <div
              style={{
                marginBottom: 18,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(245,158,11,0.28)",
                background: "rgba(245,158,11,0.1)",
                color: "#fde68a",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Supabase is not configured in this deployment. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                display: "inline-grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
                padding: 6,
                borderRadius: 18,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {[
                { key: "signin", label: "Sign in" },
                { key: "signup", label: "Create account" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => switchMode(item.key)}
                  style={{
                    border: "none",
                    borderRadius: 14,
                    padding: "12px 14px",
                    background:
                      mode === item.key ? "var(--accent-gradient)" : "transparent",
                    color:
                      mode === item.key ? "var(--text-on-accent)" : "var(--text-secondary)",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.15s ease, background 0.15s ease",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label style={{ display: "grid", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text-primary)",
                  WebkitTextFillColor: "var(--text-primary)",
                  caretColor: "var(--text-primary)",
                  padding: "14px 16px",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.65)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.14)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.02)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Password
              </span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    color: "var(--text-primary)",
                    WebkitTextFillColor: "var(--text-primary)",
                    caretColor: "var(--text-primary)",
                    padding: "14px 16px",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.parentElement.style.borderColor = "rgba(99,102,241,0.65)";
                    e.currentTarget.parentElement.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.14)";
                    e.currentTarget.parentElement.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.parentElement.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.parentElement.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.02)";
                    e.currentTarget.parentElement.style.background = "rgba(255,255,255,0.04)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--text-muted)",
                    padding: "0 14px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ico n={showPassword ? "eye-off" : "eye"} size={16} />
                </button>
              </div>
            </label>

            {mode === "signup" && (
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  padding: 16,
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                  Password requirements
                </div>
                {[
                  [passwordChecks.length, "At least 8 characters"],
                  [passwordChecks.letter, "Includes a letter"],
                  [passwordChecks.number, "Includes a number"],
                ].map(([met, label]) => (
                  <div
                    key={label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: met ? "var(--success-text)" : "var(--text-muted)",
                    }}
                  >
                    <Ico n={met ? "check" : "clock"} size={14} color="currentColor" />
                    {label}
                  </div>
                ))}
              </div>
            )}

            {isLocked && (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(245,158,11,0.25)",
                  background: "rgba(245,158,11,0.1)",
                  color: "#fde68a",
                  fontSize: 13,
                  padding: "12px 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ico n="clock" size={14} />
                Try again in {cooldownSeconds}s
              </div>
            )}

            {error && (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(239,68,68,0.22)",
                  background: "rgba(239,68,68,0.1)",
                  color: "#fecaca",
                  fontSize: 13,
                  padding: "12px 14px",
                }}
                role="alert"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(16,185,129,0.22)",
                  background: "rgba(16,185,129,0.1)",
                  color: "#a7f3d0",
                  fontSize: 13,
                  padding: "12px 14px",
                }}
                aria-live="polite"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              style={{
                marginTop: 4,
                border: "none",
                borderRadius: 16,
                padding: "14px 16px",
                background: "var(--accent-gradient)",
                color: "var(--text-on-accent)",
                fontWeight: 800,
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                cursor: loading || isLocked ? "not-allowed" : "pointer",
                opacity: loading || isLocked ? 0.82 : 1,
                boxShadow: "0 18px 40px rgba(99,102,241,0.22)",
              }}
            >
              {loading && <Spin size={16} color="var(--text-on-accent)" />}
              {submitLabel}
            </button>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
                marginTop: 2,
              }}
            >
              {[
                "Role-based onboarding",
                "Team-safe permissions",
                "Secure session storage",
              ].map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--text-secondary)",
                    fontSize: 12,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 11,
                lineHeight: 1.55,
                textAlign: "center",
                maxWidth: 520,
                margin: "0 auto",
              }}
            >
              By continuing, you agree to secure account access and responsible use of connected store credentials.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
