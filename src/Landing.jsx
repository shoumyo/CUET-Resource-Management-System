import "./Landing.css";
import adminBldg from "./Photos/ADMINSTRATIVE_BUILDING.webp";
import cuetImg from "./Photos/CUET.jpg";
import aboutImg from "./Photos/about.jpg";
import cuetLogo from "./Photos/cuet-logo.png";

export default function Landing({ onNavigate }) {
    return (
        <div className="landing-container">
            <header>
                <nav className="navbar">
                    <div className="logo-container">
                       <img src={cuetLogo} alt="CUET Logo" className="navbar-logo" />
                       <h1 className="logo">CUET Resource Manager</h1>
                    </div>
                    <div className="nav-links">
                        <button onClick={() => onNavigate("login")} className="nav-btn-text">Sign In</button>
                        <button onClick={() => onNavigate("login")} className="btn glow-btn">Sign Up</button>
                    </div>
                </nav>
            </header>

            <section className="hero">
                <div className="hero-bg">
                    <img src={adminBldg} alt="CUET Administrative Building" />
                    <div className="hero-overlay"></div>
                </div>
                <div className="hero-content animate-slide-up">
                    <h2 className="hero-title">Elevate Campus Booking</h2>
                    <p className="hero-subtitle">
                        Reserve seminar rooms, and labs easily with smart scheduling and intelligent approval management.
                    </p>
                    <div className="hero-buttons">
                        <button onClick={() => onNavigate("login")} className="primary-btn pulse-btn">Get Started</button>
                        <button onClick={() => onNavigate("login")} className="secondary-btn">Login</button>
                    </div>
                </div>
            </section>

            <section className="image-grid-section">
                <div className="section-header animate-fade-in">
                    <h2>Experience Our Facilities</h2>
                    <p>State-of-the-art resources at your fingertips.</p>
                </div>
                <div className="image-grid">
                    <div className="grid-item item-1 animate-slide-in-left">
                        <img src={cuetImg} alt="CUET Campus" />
                        <div className="item-overlay"><span>Main Campus</span></div>
                    </div>
                    <div className="grid-item item-2 animate-slide-in-right">
                        <img src={aboutImg} alt="About CUET" />
                        <div className="item-overlay"><span>Student Life</span></div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="feature-card animate-pop-in delay-1">
                    <div className="feature-icon">📅</div>
                    <h3>Automated Conflict Resolution</h3>
                    <p>Eliminate scheduling redundancies through an advanced, real-time calendar management architecture.</p>
                </div>
                <div className="feature-card animate-pop-in delay-2">
                    <div className="feature-icon">🔐</div>
                    <h3>Verified Access Control</h3>
                    <p>Ensure data integrity and system security via robust, institutional email-authenticated role distribution.</p>
                </div>
                <div className="feature-card animate-pop-in delay-3">
                    <div className="feature-icon">⚡</div>
                    <h3>Centralized Administration</h3>
                    <p>Optimize facility allocation by digitizing oversight and accelerating administrative approvals across the campus.</p>
                </div>
            </section>
        </div>
    );
}