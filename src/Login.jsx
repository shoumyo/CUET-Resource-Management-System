import { useState, useEffect } from "react";
import { login, register } from "./api/authApi";
import { useToast } from "./components/Toast";
import cuetLogo from "./Photos/cuet-logo.png";

const roleConfig = {
  STUDENT: {
    icon: "school",
    color: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50",
    lightText: "text-blue-700",
    activeBg: "bg-blue-600",
    description: "Access resource booking as a student",
    placeholder: "student@cuet.ac.bd",
  },
  TEACHER: {
    icon: "person",
    color: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50",
    lightText: "text-emerald-700",
    activeBg: "bg-emerald-600",
    description: "Approve and manage student bookings",
    placeholder: "teacher@cuet.ac.bd",
  },
  ADMIN: {
    icon: "admin_panel_settings",
    color: "from-purple-500 to-violet-600",
    lightBg: "bg-purple-50",
    lightText: "text-purple-700",
    activeBg: "bg-purple-600",
    description: "Full system control & administration",
    placeholder: "admin@cuet.ac.bd",
  },
};

export default function Login({ onNavigate, onLogin }) {
  const toast = useToast();
  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const config = roleConfig[role];

  const handleRoleChange = (newRole) => {
    if (newRole === role) return;
    setAnimating(true);
    setTimeout(() => {
      setRole(newRole);
      setError("");
      setEmail("");
      setPassword("");
      setName("");
      setFormKey((k) => k + 1);
      setAnimating(false);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isRegistering) {
        data = await register({ email, password, name, role });
        toast.success("Account created successfully!", "Welcome");
      } else {
        data = await login({ email, password });

        // Validate that the user's actual role matches the selected tab
        if (data.role !== role) {
          const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();
          const actualLabel = data.role.charAt(0) + data.role.slice(1).toLowerCase();
          const msg = `This account is registered as "${actualLabel}". Please switch to the "${actualLabel}" tab to sign in.`;
          setError(msg);
          toast.error(msg, "Wrong Section");
          setLoading(false);
          return;
        }

        toast.success(`Welcome back, ${data.name}!`, "Signed In");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "An error occurred";
      setError(msg);
      toast.error(msg, "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-on-surface font-body-md" style={{ background: "linear-gradient(135deg, #f8f9fc 0%, #eef0f7 50%, #f0f2fa 100%)" }}>
      {/* Left side illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-xl relative overflow-hidden gradient-hero">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/10 animate-float" />
        <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full border border-white/10 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-10 w-20 h-20 rounded-full bg-white/5 animate-float" style={{ animationDelay: "4s" }} />
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 overflow-hidden p-1.5">
            <img src={cuetLogo} alt="CUET Logo" className="w-full h-full object-contain bg-white rounded-xl" />
          </div>
          <h2 className="text-[32px] font-extrabold text-white mb-4 tracking-tight">
            Welcome to CUET
          </h2>
          <p className="text-[16px] text-white/70 leading-relaxed">
            Access your dashboard to manage campus resources efficiently. Book auditoriums, galleries, and outdoor facilities with ease.
          </p>
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {["Instant Booking", "Smart Scheduling", "Role-Based Access"].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-[12px] font-medium backdrop-blur-sm border border-white/10">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-xl">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-xl text-center lg:text-left">
            <button onClick={() => onNavigate("welcome")} className="flex items-center gap-xs text-primary hover:underline mb-lg text-[13px] font-medium">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
              Back to Home
            </button>
            <h1 className="text-[28px] font-extrabold text-on-surface tracking-tight mb-1">
              {isRegistering ? "Create an Account" : "Sign In"}
            </h1>
            <p className="text-[14px] text-on-surface-variant">
              {isRegistering ? "Register to manage resources" : "Select your role and enter credentials"}
            </p>
          </div>

          {/* Role Selector with icons */}
          <div className="flex bg-surface-container-low/60 p-1.5 rounded-2xl mb-6 backdrop-blur-sm gap-1.5">
            {["STUDENT", "TEACHER", "ADMIN"].map((r) => {
              const rc = roleConfig[r];
              const isActive = role === r;
              return (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`flex-1 py-2.5 px-2 text-[11px] font-semibold rounded-xl transition-all duration-300 flex flex-col items-center gap-1 ${
                    isActive
                      ? "bg-white text-primary shadow-lg scale-[1.02]"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/40"
                  }`}
                  style={isActive ? { boxShadow: "0 4px 15px rgba(79, 70, 229, 0.15)" } : {}}
                >
                  <span
                    className="material-symbols-outlined transition-all duration-300"
                    style={{
                      fontSize: isActive ? "22px" : "20px",
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {rc.icon}
                  </span>
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Role description badge */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-5 transition-all duration-300 ${config.lightBg}`}
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(-4px)" : "translateY(0)",
            }}
          >
            <span className={`material-symbols-outlined ${config.lightText}`} style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>
              {config.icon}
            </span>
            <span className={`text-[12px] font-medium ${config.lightText}`}>
              {config.description}
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[13px] font-medium flex items-start gap-2 animate-slide-up">
              <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: "18px" }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Animated form wrapper */}
          <div
            key={formKey}
            style={{
              animation: "loginFormIn 0.35s ease-out both",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <div className="animate-slide-up">
                  <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "20px" }}>person</span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border-1.5 border-outline-variant/50 bg-white text-[14px] focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                  {role.charAt(0) + role.slice(1).toLowerCase()} Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "20px" }}>email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border-1.5 border-outline-variant/50 bg-white text-[14px] focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    placeholder={config.placeholder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "20px" }}>lock</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border-1.5 border-outline-variant/50 bg-white text-[14px] focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {!isRegistering && (
                <div className="flex justify-end">
                  <a href="#" className="text-[12px] font-medium text-primary hover:underline">Forgot password?</a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 gradient-primary text-white rounded-xl text-[14px] font-semibold hover:shadow-xl hover:shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Processing...
                  </span>
                ) : (
                  isRegistering
                    ? `Create ${role.charAt(0) + role.slice(1).toLowerCase()} Account`
                    : `Sign In as ${role.charAt(0) + role.slice(1).toLowerCase()}`
                )}
              </button>
            </form>
          </div>

          <div className="mt-lg text-center">
            <p className="text-[13px] text-on-surface-variant">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => { setIsRegistering(!isRegistering); setError(""); }} className="text-primary font-semibold hover:underline">
                {isRegistering ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Inline keyframes for the form entrance animation */}
      <style>{`
        @keyframes loginFormIn {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}