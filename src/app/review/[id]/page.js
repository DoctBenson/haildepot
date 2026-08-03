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
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login')
    }  else {
  setUser(user)

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', parseInt(id))
    .maybeSingle()

  if (existingReview) {
    setAlreadyReviewed(true)
  }
}
    }
    getUser()
  }, [])

  async function handleSubmit() {
  try {
    setLoading(true)

    const { data: existingReview } = await supabase
  .from('reviews')
  .select('id')
  .eq('booking_id', parseInt(id))
  .maybeSingle()

if (existingReview) {
  alert('You have already reviewed this booking.')
  return
}

    await supabase.from('reviews').insert({
      booking_id: parseInt(id),
      customer_id: user.id,
      tradesperson_id: tradespersonId,
      rating,
      comment
    })

    alert('⭐ Thank you! Your review has been submitted.')

    router.push('/dashboard/customer')
  } catch (error) {
    console.error(error)
    alert('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}

  if (alreadyReviewed) {
  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '80px auto',
        padding: '30px',
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ color: '#10B981', marginBottom: '16px' }}>
        ⭐ Review Already Submitted
      </h2>

      <p style={{ color: '#6B7280', marginBottom: '24px' }}>
        You have already reviewed this completed job.
        Thank you for your feedback!
      </p>

      <button
        onClick={() => router.push('/dashboard/customer')}
        style={{
          background: '#1F6F8B',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          padding: '12px 24px',
          cursor: 'pointer',
          fontWeight: '700',
        }}
      >
        Back to Dashboard
      </button>
    </div>
  )
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