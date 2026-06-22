import Link from 'next/link'
import './globals.css'

export default function Home() {
  return (
    <div className="home">
      <nav className="navbar">
        <h1 className="logo">Hail Depot</h1>
        <div className="nav-links">
          <Link href="/login">Login</Link>
          <Link href="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="hero" style={{
  backgroundImage: 'url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  padding: '120px 20px'
}}>
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(11, 31, 42, 0.65)'
  }} />
  <div style={{ position: 'relative', zIndex: 1 }}>
    <h2 style={{ fontSize: '2.8rem', fontWeight: '800', color: 'white', marginBottom: '16px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
      Find Trusted Tradespeople in Accra & Kasoa
    </h2>
    <p style={{ fontSize: '1.15rem', color: '#EAF4F7', marginBottom: '32px', textAlign: 'center' }}>
      Book verified plumbers, electricians and painters instantly
    </p>
    <div className="search-bar">
      <select className="service-select">
        <option value="">Select a service</option>
        <option value="plumber">Plumber</option>
        <option value="electrician">Electrician</option>
        <option value="painter">Painter</option>
      </select>
       <Link href="/tradespeople" className="btn-search">Find Now</Link>
       </div>
       </div>
      </section>

      <section className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <h4>Search</h4>
            <p>Find a tradesperson by service type in your area</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h4>Book</h4>
            <p>Choose a time and describe your job</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h4>Get it done</h4>
            <p>Your tradesperson arrives and completes the job</p>
          </div>
        </div>
      </section>

      <section className="are-you-tradesperson">
        <h3>Are you a tradesperson?</h3>
        <p>Join Hail Depot and get more clients in Accra and Kasoa</p>
        <Link href="/register?role=tradesperson" className="btn-primary">Join as a Tradesperson</Link>
      </section>
    </div>
  )
}