import { useState, useEffect } from "react";
import { ToastProvider } from "./components/Toast";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function AppContent() {
  const [screen, setScreen] = useState("welcome");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === "STUDENT") setScreen("student");
      else if (parsedUser.role === "TEACHER") setScreen("teacher");
      else if (parsedUser.role === "ADMIN") setScreen("admin");
    }
  }, []);

  const navigate = (screen) => setScreen(screen);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === "STUDENT") setScreen("student");
    else if (userData.role === "TEACHER") setScreen("teacher");
    else if (userData.role === "ADMIN") setScreen("admin");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setScreen("login");
  };

  if (screen === "welcome") return <Welcome onNavigate={navigate} />;
  if (screen === "login") return <Login onNavigate={navigate} onLogin={handleLogin} />;
  if (screen === "student") return <StudentDashboard onLogout={handleLogout} user={user} />;
  if (screen === "teacher") return <TeacherDashboard onLogout={handleLogout} user={user} />;
  if (screen === "admin") return <AdminDashboard onLogout={handleLogout} user={user} />;

  return <Welcome onNavigate={navigate} />;
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}