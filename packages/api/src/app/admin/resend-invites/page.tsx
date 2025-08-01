'use client'

import { useState } from 'react'

export default function ResendInvitesPage() {
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleResendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/users/${userId}/resend-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ${data.message} - Email: ${data.email}`)
        setUserId('')
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to send invite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h1>Resend User Invites</h1>
      <p>Use this tool to resend invites to users who haven't confirmed their accounts.</p>
      
      <form onSubmit={handleResendInvite} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="userId" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            User ID:
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Copy user ID from Users collection"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !userId}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {isLoading ? 'Sending...' : 'Resend Invite'}
        </button>
      </form>

      {message && (
        <div
          style={{
            padding: '10px',
            borderRadius: '4px',
            marginTop: '15px',
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            color: message.includes('✅') ? '#155724' : '#721c24'
          }}
        >
          {message}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h3>How to use:</h3>
        <ol>
          <li>Go to the Users collection in Payload admin</li>
          <li>Find the user with <code>isConfirmed: false</code></li>
          <li>Copy their ID from the URL or document</li>
          <li>Paste the ID above and click "Resend Invite"</li>
        </ol>
      </div>
    </div>
  )
}