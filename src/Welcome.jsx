import { useState, useEffect, useRef } from "react";
import cuetLogo from "./Photos/cuet-logo.png";
import adminBldg from "./Photos/ADMINSTRATIVE_BUILDING.webp";
import cuetImg from "./Photos/CUET.jpg";
import aboutImg from "./Photos/about.jpg";
import landingImage from "./Photos/images (1).jpg";

const images = [adminBldg, cuetImg, aboutImg, landingImage];

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
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
  }, [isVisible, target, duration]);
  
  return <span ref={counterRef}>{count}+</span>;
}

export default function Welcome({ onNavigate }) {
  const [visible, setVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="bg-surface text-on-surface font-body-lg text-body-lg min-h-screen flex flex-col relative">
      
      {/* FULL SCREEN HERO CAROUSEL */}
      <section className="relative w-full h-screen min-h-[600px] flex items-center overflow-hidden">
        {/* Background Images */}
        {images.map((img, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${idx === currentImageIndex ? "opacity-100" : "opacity-0"}`}
          >
            <img src={img} alt="Slide" className={`w-full h-full object-cover transition-transform duration-[6000ms] ${idx === currentImageIndex ? "scale-105" : "scale-100"}`} />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/60" /> 
          </div>
        ))}

        {/* TopNavBar - Fixed and dynamic styling */}
        <nav className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md border-b border-outline-variant/30' : 'bg-transparent'}`}>
          <div className="flex items-center gap-md">
            <div className={`w-10 h-10 flex items-center justify-center p-0.5 rounded-lg ${isScrolled ? 'bg-emerald-50' : ''}`}>
              <img src={cuetLogo} alt="CUET Logo" className={`w-full h-full object-contain ${!isScrolled && 'drop-shadow-md'}`} />
            </div>
            <span className={`font-headline-md text-[20px] font-bold tracking-tight hidden sm:block transition-colors duration-300 ${isScrolled ? 'text-primary' : 'text-white drop-shadow-md'}`}>
              CUET Resource Booking System
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate("login")}
              className={`font-bold text-[15px] transition-colors duration-300 ${isScrolled ? 'text-on-surface hover:text-primary' : 'text-white/90 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate("login")}
              className="bg-amber-500 text-black font-bold text-[15px] px-6 py-2 rounded-full hover:bg-amber-400 hover:shadow-lg transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Left Arrow */}
        <button onClick={prevSlide} className="absolute left-4 md:left-8 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 border border-white/20 backdrop-blur-md transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        {/* Right Arrow */}
        <button onClick={nextSlide} className="absolute right-4 md:right-8 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 border border-white/20 backdrop-blur-md transition-all">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>

        {/* Hero Text Content */}
        <div className={`relative z-10 w-full max-w-[1440px] mx-auto px-margin-mobile md:px-[120px] transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="max-w-3xl text-left">
            <h1 className="text-[52px] md:text-[72px] font-extrabold text-white leading-[1.1] mb-6 drop-shadow-lg tracking-tight">
              Elevate Campus <br /> Booking.
            </h1>
            <p className="text-[18px] md:text-[22px] text-white/90 mb-10 drop-shadow-md leading-relaxed">
              Efficiently manage and reserve campus facilities, auditoriums, and academic resources through our secure, integrated platform designed specifically for university operations.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate("login")}
                className="bg-amber-500 text-black font-bold text-[16px] px-10 py-4 rounded-full hover:bg-amber-400 shadow-lg hover:shadow-amber-500/30 transition-all duration-200 hover:scale-[1.02]"
              >
                Get Started
              </button>
              <button 
                onClick={() => document.getElementById("stats-section")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-transparent border-2 border-white/70 text-white font-bold text-[16px] px-10 py-4 rounded-full hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
          {images.map((_, idx) => (
            <button 
              key={idx} 
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-10 bg-amber-500" : "w-2.5 bg-white/50 hover:bg-white/80"}`} 
              onClick={() => setCurrentImageIndex(idx)} 
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="w-full bg-white py-16 border-b border-outline-variant/30 shadow-sm z-10 relative">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-wrap justify-around items-center gap-8 text-center">
          {[
            { num: 15, label: "Campus Venues" },
            { num: 500, label: "Bookings Made" },
            { num: 50, label: "Active Users" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <p className="text-[48px] font-extrabold text-amber-500 mb-2 drop-shadow-sm">
                <AnimatedCounter target={s.num} />
              </p>
              <p className="text-[16px] text-on-surface-variant font-bold tracking-widest uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Below Hero */}
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl md:py-[100px]">
        {/* How it Works Section */}
        <section className="w-full flex flex-col items-center gap-xl">
          <div className="text-center mb-md">
            <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-[32px] font-bold text-on-surface tracking-tight">How it Works</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">Three simple steps to secure your required campus resources.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {[
              { icon: "login", title: "1. Sign In", desc: "Authenticate using your official CUET institutional credentials to access the system.", color: "bg-blue-50 text-blue-600" },
              { icon: "date_range", title: "2. Choose Resource", desc: "Browse available rooms, auditoriums, and equipment, then select your required dates.", color: "bg-purple-50 text-purple-600" },
              { icon: "verified", title: "3. Get Approval", desc: "Submit your request for review and receive instant notifications upon approval.", color: "bg-emerald-50 text-emerald-600" },
            ].map((step, i) => (
              <div
                key={step.title}
                className="card-level-1 p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border border-outline-variant/30"
              >
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6`}>
                  <span className="material-symbols-outlined" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                </div>
                <h3 className="text-[20px] font-bold text-on-surface mb-3">{step.title}</h3>
                <p className="text-[14px] text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 py-lg mt-auto">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-label-sm text-label-sm text-on-surface-variant">© 2024 CUET Resource Booking System. All rights reserved.</span>
          <div className="flex gap-lg">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-amber-500 text-black shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-amber-400 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(245,158,11,0.4)] transition-all duration-300 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>arrow_upward</span>
      </button>
    </div>
  );
}
