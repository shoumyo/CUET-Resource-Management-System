export default function Welcome({ onNavigate }) {
  return (
    <div className="bg-surface text-on-surface font-body-lg text-body-lg min-h-screen flex flex-col pt-16">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface-container-lowest border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <img alt="CUET Logo" className="h-10 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgrIW-mxdk6LQFkpg9BWVU5AsatYawkevMXbud-hnCDY4Mh3qRSPqwd1S2ebkXLmxyXBR3dtVsWfUKmw9tRU9kbFMx0JvtOkDbIHYEG47RAqFRfoZOb88IzccwN7R-XZTatokq2tm28kRPB3sbKx_0441uZS8C8zhBCpwi12dElsZe9zaQyKPTPjTk_975JRR3AARkv6BHqAuRnDOG7An2fg53GQhvANfMgJLNwWcBUubyyrAGNFOuU50wbj3SwVpYLHowF9kzCPsh" />
          <span className="font-headline-md text-headline-md font-bold text-primary">CUET Booking</span>
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
            className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded hover:bg-on-primary-fixed-variant transition-colors duration-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl md:py-[80px]">
        {/* Hero Section */}
        <section className="w-full flex flex-col md:flex-row items-center gap-xl md:gap-[80px] mb-24">
          <div className="w-full md:w-1/2 flex flex-col items-start gap-lg text-left">
            <h1 className="font-display-lg text-display-lg text-on-surface">Streamlined Resource Booking for CUET.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Efficiently manage and reserve campus facilities, auditoriums, and academic resources through our secure, integrated platform designed specifically for university operations.
            </p>
            <div className="flex flex-wrap gap-md mt-sm">
              <button
                id="hero-getstarted-btn"
                onClick={() => onNavigate("login")}
                className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded hover:bg-on-primary-fixed-variant transition-colors duration-200"
              >
                Get Started
              </button>
              <button className="bg-surface-container-lowest text-on-surface-variant border border-outline-variant font-label-md text-label-md px-lg py-sm rounded hover:bg-surface-container-low transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-[400px] md:h-[500px] relative rounded-xl overflow-hidden border border-outline-variant">
            <img
              alt="Modern university building"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtAofiddpaqthUX1oQklNDpcdIV54EnMBC-qU57dOyn3Pq-QGO-VIwY2t8GD2GtWqsFM-WU3ssYhu0pbH0zrzF6_HevgfsZbVVzh5yPsYB1EED6cgtb_uqSp7mS1Agy-9oGRYru9qx-H4OgHflrXDgxqJbq6ZyjV7CpMuTc_YblJhmvIF1amMT2RJbzm_T8UhPcCKGvlmalZIm6iLtRURA0HMDZuh5K9TpXR_49fNNCrCkXfTlKgWzktbZ0uSFJZXt2VGua6fu-7yj"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-multiply"></div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full flex flex-col items-center gap-xl">
          <div className="text-center mb-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">How it Works</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Three simple steps to secure your required campus resources.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg w-full max-w-5xl">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex flex-col items-center text-center hover:border-outline transition-colors duration-200">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-[32px] text-on-primary" style={{fontVariationSettings: "'FILL' 1"}}>login</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">1. Sign In</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Authenticate using your official CUET institutional credentials to access the system.</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex flex-col items-center text-center hover:border-outline transition-colors duration-200">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-[32px] text-on-primary" style={{fontVariationSettings: "'FILL' 1"}}>date_range</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">2. Choose Resource</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Browse available rooms, auditoriums, and equipment, then select your required dates.</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex flex-col items-center text-center hover:border-outline transition-colors duration-200">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-[32px] text-on-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">3. Get Approval</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Submit your request for administrative review and receive instant notifications upon approval.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant py-md mt-auto">
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
