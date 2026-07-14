'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function detectTrade(query) {
  const q = query.toLowerCase()
  if (q.includes('pipe') || q.includes('leak') || q.includes('plumb') ||
      q.includes('water') || q.includes('tap') || q.includes('toilet') ||
      q.includes('drain') || q.includes('cistern')) return 'Plumber'
  if (q.includes('electric') || q.includes('wire') || q.includes('socket') ||
      q.includes('light') || q.includes('switch') || q.includes('power') ||
      q.includes('fault') || q.includes('bulb')) return 'Electrician'
  if (q.includes('paint') || q.includes('wall') || q.includes('colour') ||
      q.includes('color') || q.includes('ceiling') || q.includes('coat')) return 'Painter'
  return null
}

function TradespeopleContent() {
  const [tradespeople, setTradespeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const service = searchParams.get('service')
    const query = searchParams.get('q')

    if (service) {
      setFilter(service)
    } else if (query) {
      const detected = detectTrade(query)
      if (detected) setFilter(detected)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchTradespeople() {
      setLoading(true)
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'tradesperson')
        .eq('is_available', true)

      if (filter !== 'All') {
        query = query.eq('trade', filter)
      }

      const { data, error } = await query
      if (!error) setTradespeople(data)
      setLoading(false)
    }
    fetchTradespeople()
  }, [filter])

  const filtered = tradespeople.filter(person =>
    person.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <nav style={{
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '0 32px', height: '64px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1F6F8B', letterSpacing: '-0.04em' }}>
            Hail Depot
          </span>
        </Link>
        <Link href="/dashboard/customer" style={{ color: '#1F6F8B', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
          ← Back to Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#0B1F2A', fontWeight: '800' }}>Find a Tradesperson</h2>

        {/* Search by name */}
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '14px 20px',
            border: '1.5px solid #e5e7eb', borderRadius: '12px',
            fontSize: '1rem', marginBottom: '16px',
            outline: 'none', boxSizing: 'border-box'
          }}
        />

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['All', 'Plumber', 'Electrician', 'Painter'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '8px 20px',
                border: `2px solid ${filter === type ? '#1F6F8B' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: filter === type ? '#1F6F8B' : 'white',
                color: filter === type ? 'white' : '#374151',
                fontWeight: '600', cursor: 'pointer'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
    {[1,2,3,4,5,6].map(i => (
      <div key={i} style={{ background: '#0B1F2A', borderRadius: '20px', overflow: 'hidden', opacity: 0.6 }}>
        <div style={{ width: '100%', height: '220px', background: 'linear-gradient(90deg, #1a2f3d 25%, #1F6F8B 50%, #1a2f3d 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ padding: '20px' }}>
          <div style={{ height: '20px', background: '#1a2f3d', borderRadius: '8px', marginBottom: '12px', width: '70%' }} />
          <div style={{ height: '14px', background: '#1a2f3d', borderRadius: '8px', marginBottom: '8px', width: '50%' }} />
          <div style={{ height: '14px', background: '#1a2f3d', borderRadius: '8px', width: '90%' }} />
        </div>
      </div>
    ))}
  </div>
) : filtered.length === 0 ? (
           <p style={{ color: '#6B7280' }}>No tradespeople found.</p>
) :       (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filtered.map(person => (
              <div key={person.id} style={{
                background: '#0B1F2A', borderRadius: '20px', overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s', cursor: 'pointer'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '100%', height: '220px',
                  background: person.avatar_url ? `url(${person.avatar_url})` : 'linear-gradient(135deg, #1F6F8B, #0B1F2A)',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'flex-end', padding: '16px', position: 'relative'
                }}>
                  {!person.avatar_url && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '5rem', fontWeight: '900', color: 'rgba(255,255,255,0.15)'
                    }}>
                      {person.full_name?.charAt(0)}
                    </div>
                  )}
                  <span style={{
                    background: '#1F6F8B', color: 'white',
                    padding: '4px 12px', borderRadius: '20px',
                    fontSize: '0.8rem', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {person.trade}
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <Link href={`/tradesperson/${person.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ margin: '0', color: 'white', fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        {person.full_name}
                      </h3>
                    </Link>
                    {person.is_verified && (
                      <span style={{ background: '#1F6F8B', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.85rem' }}>📍 {person.location}</p>

                  {person.years_experience && (
                    <p style={{ margin: '0 0 4px', color: '#9ca3af', fontSize: '0.85rem' }}>
                      🛠 {person.years_experience} years experience
                    </p>
                  )}

                  <p style={{ margin: '0 0 16px', color: '#9ca3af', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {person.bio ? person.bio.substring(0, 70) + '...' : 'Available for bookings in your area'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: '0', color: 'white', fontWeight: '800', fontSize: '1rem' }}>
                      {person.rate || 'Rate on request'}
                    </p>
                    <Link href={`/book/${person.id}`} style={{
                      padding: '10px 24px', background: '#1F6F8B', color: 'white',
                      borderRadius: '10px', textDecoration: 'none',
                      fontWeight: '700', fontSize: '0.9rem'
                    }}>
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TradespeopleListPage() {
  return (
    <Suspense fallback={<p style={{ padding: '40px' }}>Loading...</p>}>
      <TradespeopleContent />
    </Suspense>
  )
}