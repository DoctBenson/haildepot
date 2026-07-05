'use client'
import Link from 'next/link'
import './globals.css'
export default function Home() {
  return (
    <div className="home">
      <nav style={{
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'white',
  borderBottom: '1px solid #e5e7eb',
  padding: '0 40px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 1px 12px rgba(0,0,0,0.08)'
}}>
  {/* Logo */}
  <Link href="/" style={{ textDecoration: 'none' }}>
    <span style={{
      fontSize: '1.5rem',
      fontWeight: '900',
      color: '#1F6F8B',
      letterSpacing: '-0.04em'
    }}>
      Hail Depot
    </span>
  </Link>

  {/* Center Links */}
  <div style={{ display: 'flex', gap: '8px' }}>
    <Link href="/tradespeople?service=Plumber" style={{
      padding: '8px 16px',
      borderRadius: '24px',
      textDecoration: 'none',
      color: '#0B1F2A',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'background 0.2s'
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      Plumbers
    </Link>
    <Link href="/tradespeople?service=Electrician" style={{
      padding: '8px 16px',
      borderRadius: '24px',
      textDecoration: 'none',
      color: '#0B1F2A',
      fontWeight: '600',
      fontSize: '0.9rem'
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      Electricians
    </Link>
    <Link href="/tradespeople?service=Painter" style={{
      padding: '8px 16px',
      borderRadius: '24px',
      textDecoration: 'none',
      color: '#0B1F2A',
      fontWeight: '600',
      fontSize: '0.9rem'
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      Painters
    </Link>
    </div>

  {/* Right — Auth buttons */}
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <Link href="/login" style={{
      padding: '8px 16px',
      borderRadius: '24px',
      textDecoration: 'none',
      color: '#0B1F2A',
      fontWeight: '600',
      fontSize: '0.9rem'
    }}>
      Log in
    </Link>
    <Link href="/register" style={{
      padding: '10px 20px',
      borderRadius: '24px',
      textDecoration: 'none',
      background: '#0B1F2A',
      color: 'white',
      fontWeight: '700',
      fontSize: '0.9rem'
    }}>
      Sign up
    </Link>
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