import { useState } from "react";
import { login, register } from "./api/authApi";

export default function Login({ onNavigate, onLogin }) {
  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      let data;
      if (isRegistering) {
        data = await register({ email, password, name, role });
      } else {
        data = await login({ email, password });
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex text-on-surface font-body-md bg-surface" style={{ backgroundColor: "#faf8ff" }}>
      {/* Left side illustration */}
      <div className="hidden lg:flex flex-1 bg-surface-container-low items-center justify-center p-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-surface to-surface"></div>
        <div className="relative z-10 text-center max-w-md">
          <h2 className="text-display-sm font-display-sm text-primary font-bold mb-md">Welcome back to CUET</h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant">Access your dashboard to manage campus resources efficiently.</p>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-xl">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-xl text-center lg:text-left">
            <button onClick={() => onNavigate("welcome")} className="flex items-center gap-xs text-primary hover:underline mb-lg text-label-md font-label-md">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Home
            </button>
            <h1 className="text-headline-lg font-headline-lg text-on-surface font-bold mb-xs">{isRegistering ? "Create an Account" : "Sign In"}</h1>
            <p className="text-body-md font-body-md text-on-surface-variant">
              {isRegistering ? "Register to manage resources" : "Enter your credentials to access your account"}
            </p>
          </div>

          <div className="flex bg-surface-container-low p-xs rounded-lg mb-lg">
            {["STUDENT", "TEACHER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-sm text-label-md font-label-md rounded-md transition-all duration-200 ${role === r ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 text-red-500 text-sm font-bold">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-md">
            {isRegistering && (
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="name@cuet.ac.bd"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {!isRegistering && (
              <div className="flex justify-end">
                <a href="#" className="text-label-sm font-label-sm text-primary hover:underline">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-sm bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:opacity-90 transition-opacity"
            >
              {isRegistering ? "Sign Up" : "Sign In"}
            </button>
          </form>

            <div className="mt-lg text-center">
              <p className="text-body-sm text-on-surface-variant">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                <button onClick={() => setIsRegistering(!isRegistering)} className="text-primary font-bold hover:underline">
                  {isRegistering ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}