'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import { use, Suspense } from 'react'

function ReviewContent({ params }) {
  const { id } = use(params)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const tradespersonId = searchParams.get('tradesperson')

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else setUser(user)
    }
    getUser()
  }, [])

  async function handleSubmit() {
    setLoading(true)
    await supabase.from('reviews').insert({
      booking_id: parseInt(id),
      customer_id: user.id,
      tradesperson_id: tradespersonId,
      rating,
      comment
    })
    router.push('/dashboard/customer')
  }

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '20px' }}>
      <h1 style={{ color: '#1F6F8B', marginBottom: '8px', fontWeight: '800' }}>Hail Depot</h1>
      <h2 style={{ marginBottom: '24px' }}>Leave a Review</h2>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontWeight: '600', marginBottom: '12px', color: '#0B1F2A' }}>Rating</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              style={{
                fontSize: '2rem', background: 'none', border: 'none',
                cursor: 'pointer', opacity: star <= rating ? 1 : 0.3,
                transition: 'opacity 0.2s'
              }}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontWeight: '600', marginBottom: '12px', color: '#0B1F2A' }}>Comment</p>
        <textarea
          placeholder="How was the service? What did they do well?"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', padding: '14px', background: '#1F6F8B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  )
}

export default function ReviewPage({ params }) {
  return (
    <Suspense fallback={<p style={{ padding: '40px' }}>Loading...</p>}>
      <ReviewContent params={params} />
    </Suspense>
  )
}