'use client'
import Link from 'next/link'
import './globals.css'

export default function Home() {
  return (
    <div className="home">
      <nav className="navbar">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="logo">Hail Depot</span>
        </Link>

        <div className="nav-center">
          <Link href="/tradespeople?service=Plumber" className="nav-link">Plumbers</Link>
          <Link href="/tradespeople?service=Electrician" className="nav-link">Electricians</Link>
          <Link href="/tradespeople?service=Painter" className="nav-link">Painters</Link>
        </div>

        <div className="nav-right">
          <Link href="/login" className="nav-link">Log in</Link>
          <Link href="/register" className="nav-cta">Sign up</Link>
        </div>
      </nav>

      <section className="hero" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        padding: '160px 20px'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(11, 31, 42, 0.65)'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '2.8rem', fontWeight: '800', color: 'white',
            marginBottom: '16px', maxWidth: '600px',
            marginLeft: 'auto', marginRight: 'auto', textAlign: 'center'
          }}>
            What do you need done?
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#EAF4F7', marginBottom: '32px', textAlign: 'center' }}>
            Describe your problem — we'll find the right person
          </p>

          <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              id="job-search"
              type="text"
              placeholder="e.g. Fix leaking pipe, Paint my house..."
              style={{
                flex: 1, padding: '16px 20px', borderRadius: '12px',
                border: 'none', fontSize: '1rem', outline: 'none', minWidth: '200px'
              }}
            />
            <button
              onClick={() => {
                const query = document.getElementById('job-search').value
                window.location.href = `/tradespeople?q=${encodeURIComponent(query)}`
              }}
              style={{
                padding: '16px 28px', background: '#1F6F8B', color: 'white',
                border: 'none', borderRadius: '12px', fontWeight: '700',
                fontSize: '1rem', cursor: 'pointer'
              }}
            >
              Find Now
            </button>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Fix leaking pipe', 'Install water heater', 'Paint my house', 'Fix electrical fault'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => window.location.href = `/tradespeople?q=${encodeURIComponent(suggestion)}`}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>


      <section
        style={{
          padding: '80px 20px',
          background: '#F8FAFC',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '2.2rem',
              fontWeight: '800',
              color: '#0B1F2A',
              marginBottom: '12px',
            }}
          >
            Choose your experience
          </h2>

          <p
            style={{
              color: '#6B7280',
              fontSize: '1.05rem',
              maxWidth: '650px',
              margin: '0 auto 50px',
            }}
          >
            Whether you're looking for a trusted professional or growing your
            trade business, HailDepot is built for you.
          </p>

          <div
            className="home-role-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Customer */}

            <div
              style={{
                background: 'white',
                borderRadius: '18px',
                padding: '36px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                👤
              </div>

              <h3
                style={{
                  color: '#0B1F2A',
                  fontWeight: '700',
                  marginBottom: '12px',
                }}
              >
                I'm looking for a tradesperson
              </h3>

              <p
                style={{
                  color: '#6B7280',
                  marginBottom: '28px',
                }}
              >
                Find trusted plumbers, electricians, painters and other skilled
                professionals near you.
              </p>

              <Link
                href="/login"
                className="btn-primary"
              >
                Continue as Customer
              </Link>
            </div>

            {/* Tradesperson */}

            <div
              style={{
                background: 'white',
                borderRadius: '18px',
                padding: '36px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                🛠️
              </div>

              <h3
                style={{
                  color: '#0B1F2A',
                  fontWeight: '700',
                  marginBottom: '12px',
                }}
              >
                I provide trade services
              </h3>

              <p
                style={{
                  color: '#6B7280',
                  marginBottom: '28px',
                }}
              >
                Join HailDepot, receive verified bookings, build your reputation,
                and grow your business.
              </p>

              <Link
                href="/login"
                className="btn-primary"
              >
                Continue as Tradesperson
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <h4>Describe</h4>
            <p>Tell us what needs fixing or doing</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h4>Match</h4>
            <p>We find the right tradesperson for your job</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h4>Get it done</h4>
            <p>Your tradesperson arrives and completes the job</p>
          </div>
        </div>
      </section>

    
    </div>
  )
}
