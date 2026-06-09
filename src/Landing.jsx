import "./Landing.css";

export default function Landing({ onNavigate }) {
    return (
        <>
            <header>
                <nav className="navbar">
                    <h1 className="logo">CUET RESOURCE BOOKING SYSTEM</h1>
                    <div className="nav-links">
                        <button 
                            onClick={() => onNavigate("login")} 
                            className="nav-btn-text"
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => onNavigate("login")} 
                            className="btn"
                        >
                            Sign Up
                        </button>
                    </div>
                </nav>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <h2>CUET Resource Booking System</h2>
                    <p>
                        Reserve seminar rooms, and labs easily
                        with smart scheduling and approval management.
                    </p>
                    <div className="hero-buttons">
                        <button
                            onClick={() => onNavigate("login")}
                            className="primary-btn"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => onNavigate("login")}
                            className="secondary-btn"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </section>
            <section className="features">
                <div className="feature-card">
                    <h3>📅 Automated Conflict Resolution</h3>
                    <p>
                        Eliminate scheduling redundancies through an advanced, real-time calendar management architecture.
                    </p>
                </div>
                <div className="feature-card">
                    <h3>🔐 Verified Access Contro</h3>
                    <p>
                        Ensure data integrity and system security via robust, institutional email-authenticated role distribution.
                    </p>
                </div>
                <div className="feature-card">
                    <h3>⚡ Centralized Administration</h3>
                    <p>
                        Optimize facility allocation by digitizing oversight and accelerating administrative approvals across the campus.
                    </p>
                </div>
            </section>
        </>
    );
}