import { useState, useEffect } from "react";

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <span>{count}+</span>;
}

export default function Welcome({ onNavigate }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <div className="bg-surface text-on-surface font-body-lg text-body-lg min-h-screen flex flex-col pt-16">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-white/80 backdrop-blur-xl border-b border-outline-variant/30 transition-all">
        <div className="flex items-center gap-md">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>school</span>
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">CUET Booking</span>
        </div>
        <div className="flex items-center gap-sm">
          <button
            id="welcome-signin-btn"
            onClick={() => onNavigate("login")}
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors px-md py-sm"
          >
            Sign In
          </button>
          <button
            id="welcome-getstarted-btn"
            onClick={() => onNavigate("login")}
            className="gradient-primary text-white font-label-md text-label-md px-lg py-sm rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl md:py-[80px]">
        {/* Hero Section */}
        <section className={`w-full flex flex-col md:flex-row items-center gap-xl md:gap-[80px] mb-24 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="w-full md:w-1/2 flex flex-col items-start gap-lg text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-[12px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
              System Live — Ready to Book
            </div>
            <h1 className="text-[42px] md:text-[52px] leading-tight font-extrabold text-on-surface tracking-tight">
              Streamlined Resource
              <span className="block text-primary">Booking for CUET.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
              Efficiently manage and reserve campus facilities, auditoriums, and academic resources through our secure, integrated platform designed specifically for university operations.
            </p>
            <div className="flex flex-wrap gap-3 mt-sm">
              <button
                id="hero-getstarted-btn"
                onClick={() => onNavigate("login")}
                className="gradient-primary text-white font-label-md text-[14px] px-7 py-3 rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started →
              </button>
              <button className="bg-white text-on-surface-variant border border-outline-variant/50 font-label-md text-[14px] px-7 py-3 rounded-xl hover:bg-surface-container-low hover:border-outline transition-all duration-200">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-6 pt-6 border-t border-outline-variant/30 w-full">
              {[
                { num: 15, label: "Campus Venues" },
                { num: 500, label: "Bookings Made" },
                { num: 50, label: "Active Users" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[28px] font-bold text-primary">
                    <AnimatedCounter target={s.num} />
                  </p>
                  <p className="text-[12px] text-on-surface-variant font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2 h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl shadow-primary/5">
            <img
              alt="Modern university building"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtAofiddpaqthUX1oQklNDpcdIV54EnMBC-qU57dOyn3Pq-QGO-VIwY2t8GD2GtWqsFM-WU3ssYhu0pbH0zrzF6_HevgfsZbVVzh5yPsYB1EED6cgtb_uqSp7mS1Agy-9oGRYru9qx-H4OgHflrXDgxqJbq6ZyjV7CpMuTc_YblJhmvIF1amMT2RJbzm_T8UhPcCKGvlmalZIm6iLtRURA0HMDZuh5K9TpXR_49fNNCrCkXfTlKgWzktbZ0uSFJZXt2VGua6fu-7yj"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {/* Floating card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: "22px" }}>verified</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-on-surface">Instant Booking Confirmation</p>
                  <p className="text-[11px] text-on-surface-variant">Get approved in minutes with our streamlined workflow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full flex flex-col items-center gap-xl">
          <div className="text-center mb-md">
            <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-[32px] font-bold text-on-surface tracking-tight">How it Works</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">Three simple steps to secure your required campus resources.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
            {[
              { icon: "login", title: "1. Sign In", desc: "Authenticate using your official CUET institutional credentials to access the system.", color: "bg-blue-50 text-blue-600" },
              { icon: "date_range", title: "2. Choose Resource", desc: "Browse available rooms, auditoriums, and equipment, then select your required dates.", color: "bg-purple-50 text-purple-600" },
              { icon: "verified", title: "3. Get Approval", desc: "Submit your request for review and receive instant notifications upon approval.", color: "bg-emerald-50 text-emerald-600" },
            ].map((step, i) => (
              <div
                key={step.title}
                className="card-level-1 p-6 flex flex-col items-center text-center animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
              >
                <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                </div>
                <h3 className="text-[18px] font-bold text-on-surface mb-2">{step.title}</h3>
                <p className="text-[14px] text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/50 backdrop-blur-lg border-t border-outline-variant/30 py-md mt-auto">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant">© 2024 CUET Resource System. All rights reserved.</span>
          <div className="flex gap-md">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
