'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

export default function TradespersonProfile({ params }) {
  const { id } = use(params)
  const [tradesperson, setTradesperson] = useState(null)
  const [reviews, setReviews] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [bio, setBio] = useState('')
  const [rate, setRate] = useState('')
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      setTradesperson(profile)
      setBio(profile?.bio || '')
      setRate(profile?.rate || '')
      setIsOwner(user?.id === id)

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('tradesperson_id', id)

      setReviews(reviewData || [])
    }
    getData()
  }, [])

  async function handleSaveProfile() {
    await supabase.from('profiles').update({ bio, rate }).eq('id', id)
    setTradesperson({ ...tradesperson, bio, rate })
    setEditing(false)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, { upsert: true })

    if (!uploadError) {
      const { data } = supabase.storage.from('profiles').getPublicUrl(fileName)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', id)
      setTradesperson({ ...tradesperson, avatar_url: data.publicUrl })
    }
    setUploading(false)
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (!tradesperson) return <p style={{ padding: '40px' }}>Loading...</p>

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ color: '#1F6F8B', fontSize: '1.6rem', fontWeight: '800' }}>Hail Depot</h1>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#1F6F8B', cursor: 'pointer', fontWeight: '600' }}>← Back</button>
      </nav>

      {/* Profile Card */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        
        {/* Photo and Name */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            {tradesperson.avatar_url ? (
              <img
                src={tradesperson.avatar_url}
                alt={tradesperson.full_name}
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #EAF4F7' }}
              />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#EAF4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '700', color: '#1F6F8B', border: '3px solid #1F6F8B' }}>
                {tradesperson.full_name?.charAt(0)}
              </div>
            )}
            {isOwner && (
              <label style={{ position: 'absolute', bottom: '0', right: '0', background: '#1F6F8B', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '0.8rem' }}>
                +
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', color: '#0B1F2A', fontSize: '1.5rem' }}>{tradesperson.full_name}</h2>
            <p style={{ margin: '0 0 4px', color: '#1F6F8B', fontWeight: '600', fontSize: '1rem' }}>{tradesperson.trade}</p>
            <p style={{ margin: '0 0 8px', color: '#6B7280', fontSize: '0.9rem' }}>📍 {tradesperson.location}</p>
            {avgRating && (
              <p style={{ margin: '0', color: '#0B1F2A', fontWeight: '600' }}>⭐ {avgRating} ({reviews.length} reviews)</p>
            )}
          </div>
        </div>

        {/* Rate */}
        <div style={{ background: '#EAF4F7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          {editing ? (
            <input
              placeholder="Your hourly rate e.g. GH₵ 150/hr"
              value={rate}
              onChange={e => setRate(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1.5px solid #1F6F8B', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          ) : (
            <p style={{ margin: '0', fontWeight: '700', color: '#0B1F2A', fontSize: '1.1rem' }}>
              {tradesperson.rate || 'Rate not set'}
            </p>
          )}
        </div>

        {/* Bio */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 10px', color: '#0B1F2A' }}>About</h3>
          {editing ? (
            <textarea
              placeholder="Tell customers about your experience, skills and what makes you stand out..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '12px', border: '1.5px solid #1F6F8B', borderRadius: '12px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          ) : (
            <p style={{ margin: '0', color: '#6B7280', lineHeight: '1.7', fontSize: '0.95rem' }}>
              {tradesperson.bio || 'No bio added yet.'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isOwner ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            {editing ? (
              <>
                <button onClick={handleSaveProfile} style={{ flex: 1, padding: '12px', background: '#1F6F8B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)} style={{ padding: '12px 20px', background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', color: '#6B7280' }}>
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{ padding: '12px 28px', background: '#0B1F2A', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                Edit Profile
              </button>
            )}
          </div>
        ) : (
          <Link href={`/book/${id}`} style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#1F6F8B', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '1rem' }}>
            Book Now
          </Link>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h3 style={{ marginBottom: '16px', color: '#0B1F2A' }}>Reviews {reviews.length > 0 && `(${reviews.length})`}</h3>
        {reviews.length === 0 ? (
          <p style={{ color: '#6B7280' }}>No reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map((review, index) => (
              <div key={index} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p style={{ margin: '0 0 6px', fontWeight: '600' }}>{'⭐'.repeat(review.rating)}</p>
                <p style={{ margin: '0', color: '#6B7280', fontSize: '0.9rem' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}