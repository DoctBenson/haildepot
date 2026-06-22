'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function TradespeopleContent() {
  const [tradespeople, setTradespeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const service = searchParams.get('service')
    if (service) setFilter(service)
  }, [searchParams])

  useEffect(() => {
    async function fetchTradespeople() {
      setLoading(true)
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'tradesperson')

      if (filter !== 'All') {
        query = query.eq('trade', filter)
      }

      const { data, error } = await query
      if (!error) setTradespeople(data)
      setLoading(false)
    }
    fetchTradespeople()
  }, [filter])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ color: '#1F6F8B', fontSize: '1.6rem', fontWeight: '800' }}>Hail Depot</h1>
        <Link href="/dashboard/customer" style={{ color: '#1F6F8B', textDecoration: 'none', fontWeight: '600' }}>← Back to Dashboard</Link>
      </nav>

      <h2 style={{ marginBottom: '20px' }}>Find a Tradesperson</h2>

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
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6B7280' }}>Loading...</p>
      ) : tradespeople.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No tradespeople found in this category yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {tradespeople.map(person => (
            <div key={person.id} style={{
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{
                width: '100%', height: '200px',
                background: person.avatar_url ? `url(${person.avatar_url})` : '#EAF4F7',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {!person.avatar_url && (
                  <div style={{ fontSize: '4rem', fontWeight: '800', color: '#1F6F8B' }}>
                    {person.full_name?.charAt(0)}
                  </div>
                )}
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <Link href={`/tradesperson/${person.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ margin: '0', color: '#0B1F2A', fontSize: '1rem', fontWeight: '700' }}>{person.full_name}</h3>
                  </Link>
                  <span style={{ color: '#0B1F2A', fontSize: '0.85rem', fontWeight: '600' }}>⭐ New</span>
                </div>
                <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.9rem' }}>{person.trade} · {person.location}</p>
                <p style={{ margin: '0 0 12px', color: '#6B7280', fontSize: '0.85rem' }}>
                  {person.bio ? person.bio.substring(0, 60) + '...' : 'Available for bookings'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: '0', color: '#0B1F2A', fontWeight: '700', fontSize: '0.95rem' }}>
                    {person.rate || 'Rate on request'}
                  </p>
                  <Link
                    href={`/book/${person.id}`}
                    style={{ padding: '8px 20px', background: '#1F6F8B', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}
                  >
                    Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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