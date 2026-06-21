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
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '20px' }}>
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
        <div style={{ display: 'grid', gap: '16px' }}>
          {tradespeople.map(person => (
            <div key={person.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <Link href={`/tradesperson/${person.id}`} style={{ textDecoration: 'none' }}>
                 <h3 style={{ margin: '0 0 4px', color: '#1F6F8B', cursor: 'pointer' }}>{person.full_name}</h3>
                </Link>
                <p style={{ margin: '0 0 4px', color: '#1F6F8B', fontWeight: '600' }}>{person.trade}</p>
                <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.9rem' }}>📍 {person.location}</p>
                {person.rate && <p style={{ margin: '0', color: '#6B7280', fontSize: '0.9rem' }}>💰 {person.rate}</p>}
              </div>
              <Link
                href={`/book/${person.id}`}
                style={{ padding: '10px 24px', background: '#1F6F8B', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}
              >
                Book Now
              </Link>
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