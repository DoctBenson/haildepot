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
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const [bio, setBio] = useState('')
  const [rate, setRate] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [responseTime, setResponseTime] = useState('')
  const [warranty, setWarranty] = useState('')

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      console.log('Profile loaded:', profile)
      console.log('is_available:', profile?.is_available)
      console.log('Tradesperson state:', tradesperson)

      setTradesperson(profile)
      setBio(profile?.bio || '')
      setRate(profile?.rate || '')
      setYearsExperience(profile?.years_experience || '')
      setResponseTime(profile?.response_time || '')
      setWarranty(profile?.warranty || '')
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
    await supabase.from('profiles').update({
      bio, rate, years_experience: yearsExperience,
      response_time: responseTime, warranty
    }).eq('id', id)
    setTradesperson({ ...tradesperson, bio, rate, years_experience: yearsExperience, response_time: responseTime, warranty })
    setEditing(false)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${id}/${id}.${fileExt}`
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
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* Navbar */}
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
        <button onClick={() => router.back()} style={{
          background: 'none', border: '1.5px solid #e5e7eb',
          borderRadius: '24px', padding: '8px 16px',
          color: '#0B1F2A', cursor: 'pointer', fontWeight: '600'
        }}>← Back</button>
      </nav>

      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Profile Card */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '32px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: '24px'
        }}>
          {/* Photo + Name */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              {tradesperson.avatar_url ? (
                <img src={tradesperson.avatar_url} alt={tradesperson.full_name}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #EAF4F7' }} />
              ) : (
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: '#EAF4F7', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '2.5rem', fontWeight: '700',
                  color: '#1F6F8B', border: '3px solid #1F6F8B'
                }}>
                  {tradesperson.full_name?.charAt(0)}
                </div>
              )}
              {isOwner && (
                <label style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: '#1F6F8B', borderRadius: '50%',
                  width: '28px', height: '28px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white', fontSize: '1rem'
                }}>
                  +
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: '0', color: '#0B1F2A', fontSize: '1.6rem', fontWeight: '800' }}>
                  {tradesperson.full_name}
                </h2>
                {tradesperson.is_verified && (
                  <span style={{
                    background: '#1F6F8B', color: 'white',
                    padding: '3px 10px', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: '700'
                  }}>✓ Verified</span>
                )}
              </div>
              <p style={{ margin: '4px 0', color: '#1F6F8B', fontWeight: '600', fontSize: '1rem' }}>{tradesperson.trade}</p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: tradesperson.is_available ? '#DCFCE7' : '#FEE2E2',
                  color: tradesperson.is_available ? '#166534' : '#991B1B',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}
              >
                {tradesperson.is_available ? '🟢 Available' : '🔴 Busy'}
              </div>

              <p style={{ margin: '4px 0', color: '#6B7280', fontSize: '0.9rem' }}>📍 {tradesperson.location}</p>

              {avgRating && (
                <p style={{ margin: '4px 0', color: '#0B1F2A', fontWeight: '700' }}>
                  ⭐ {avgRating} <span style={{ color: '#6B7280', fontWeight: '400' }}>({reviews.length} reviews)</span>
                </p>
              )}
            </div>
          </div>

          {/* Trust Signals */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px', marginBottom: '24px'
          }}>
            {tradesperson.years_experience && (
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: '800', color: '#0B1F2A' }}>
                  {tradesperson.years_experience}
                </p>
                <p style={{ margin: '0', fontSize: '0.8rem', color: '#6B7280' }}>Years Experience</p>
              </div>
            )}
            {tradesperson.jobs_completed > 0 && (
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: '800', color: '#0B1F2A' }}>
                  {tradesperson.jobs_completed}
                </p>
                <p style={{ margin: '0', fontSize: '0.8rem', color: '#6B7280' }}>Jobs Done</p>
              </div>
            )}
            {avgRating && (
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: '800', color: '#0B1F2A' }}>
                  {avgRating}⭐
                </p>
                <p style={{ margin: '0', fontSize: '0.8rem', color: '#6B7280' }}>Rating</p>
              </div>
            )}
            {tradesperson.response_time && (
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: '800', color: '#0B1F2A' }}>
                  {tradesperson.response_time}
                </p>
                <p style={{ margin: '0', fontSize: '0.8rem', color: '#6B7280' }}>Response Time</p>
              </div>
            )}
          </div>

          {/* Rate */}
          <div style={{ background: '#EAF4F7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            {editing ? (
              <input placeholder="Your rate e.g. GH₵150/hr" value={rate} onChange={e => setRate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid #1F6F8B', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
            ) : (
              <p style={{ margin: '0', fontWeight: '800', color: '#0B1F2A', fontSize: '1.1rem' }}>
                💰 {tradesperson.rate || 'Rate not set'}
              </p>
            )}
          </div>

          {/* About */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px', color: '#0B1F2A' }}>About</h3>
            {editing ? (
              <textarea placeholder="Tell customers about yourself..." value={bio} onChange={e => setBio(e.target.value)}
                rows={4} style={{ width: '100%', padding: '12px', border: '1.5px solid #1F6F8B', borderRadius: '12px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            ) : (
              <p style={{ margin: '0', color: '#6B7280', lineHeight: '1.7' }}>
                {tradesperson.bio || 'No bio added yet.'}
              </p>
            )}
          </div>

          {/* Warranty */}
          {(tradesperson.warranty || editing) && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px', color: '#0B1F2A' }}>Warranty</h3>
              {editing ? (
                <input placeholder="e.g. 3 months warranty on all work" value={warranty} onChange={e => setWarranty(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #1F6F8B', borderRadius: '12px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              ) : (
                <p style={{ margin: '0', color: '#6B7280' }}>🛡️ {tradesperson.warranty}</p>
              )}
            </div>
          )}

          {/* Extra fields when editing */}
          {editing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <input placeholder="Years of experience e.g. 8" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)}
                style={{ padding: '12px', border: '1.5px solid #1F6F8B', borderRadius: '12px', fontSize: '0.95rem' }} />
              <input placeholder="Response time e.g. Within 1hr" value={responseTime} onChange={e => setResponseTime(e.target.value)}
                style={{ padding: '12px', border: '1.5px solid #1F6F8B', borderRadius: '12px', fontSize: '0.95rem' }} />
            </div>
          )}

          {/* Action Buttons */}
          {isOwner ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              {editing ? (
                <>
                  <button onClick={handleSaveProfile} style={{
                    flex: 1, padding: '12px', background: '#1F6F8B', color: 'white',
                    border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'
                  }}>Save Changes</button>
                  <button onClick={() => setEditing(false)} style={{
                    padding: '12px 20px', background: 'transparent',
                    border: '1.5px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', color: '#6B7280'
                  }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} style={{
                  padding: '12px 28px', background: '#0B1F2A', color: 'white',
                  border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'
                }}>Edit Profile</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href={`/book/${id}`} style={{
                display: 'block', textAlign: 'center', padding: '14px',
                background: '#1F6F8B', color: 'white', borderRadius: '12px',
                textDecoration: 'none', fontWeight: '700', fontSize: '1rem'
              }}>
                Book Now
              </Link>

              {tradesperson.phone && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={`tel:${tradesperson.phone}`} style={{
                    flex: 1, display: 'block', textAlign: 'center', padding: '12px',
                    background: '#0B1F2A', color: 'white', borderRadius: '12px',
                    textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem'
                  }}>
                    📞 Call
                  </a>
                  <a href={`https://wa.me/${tradesperson.phone.replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      flex: 1, display: 'block', textAlign: 'center', padding: '12px',
                      background: '#25D366', color: 'white', borderRadius: '12px',
                      textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem'
                    }}>
                    💬 WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#0B1F2A' }}>
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h3>
          {reviews.length === 0 ? (
            <p style={{ color: '#6B7280' }}>No reviews yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((review, index) => (
                <div key={index} style={{
                  background: '#f9fafb', borderRadius: '12px', padding: '16px'
                }}>
                  <p style={{ margin: '0 0 6px', fontWeight: '700', color: '#0B1F2A' }}>
                    {'⭐'.repeat(review.rating)}
                  </p>
                  <p style={{ margin: '0', color: '#6B7280', fontSize: '0.9rem' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}