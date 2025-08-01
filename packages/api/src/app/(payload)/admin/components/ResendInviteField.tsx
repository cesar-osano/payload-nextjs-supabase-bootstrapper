'use client'

import React, { useState } from 'react'

interface ResendInviteFieldProps {
  data?: {
    id?: string
    email?: string
    isConfirmed?: boolean
  }
}

const ResendInviteField: React.FC<ResendInviteFieldProps> = ({ data }) => {
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')

  const handleResendInvite = async () => {
    if (!data?.id) return

    setIsResending(true)
    setMessage('')

    try {
      const response = await fetch(`/api/users/${data.id}/resend-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`✅ Invite sent to ${data.email}`)
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (_error) {
      setMessage('❌ Failed to send invite')
    } finally {
      setIsResending(false)
    }
  }

  if (!data?.id) {
    return (
      <div style={{ padding: '10px', color: '#666' }}>
        No user data available
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '12px', 
      border: '1px solid #e1e5e9', 
      borderRadius: '6px', 
      backgroundColor: '#f9fafb',
      margin: '8px 0'
    }}>
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
        <strong>Account Status:</strong>{' '}
        {data.isConfirmed ? (
          <span style={{ color: '#10b981', fontWeight: '600' }}>✅ Confirmed</span>
        ) : (
          <span style={{ color: '#ef4444', fontWeight: '600' }}>⏳ Pending Confirmation</span>
        )}
      </div>
      
      {!data.isConfirmed && (
        <div style={{ marginBottom: '8px' }}>
          <button
            onClick={handleResendInvite}
            disabled={isResending}
            style={{
              padding: '6px 12px',
              backgroundColor: isResending ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isResending ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              opacity: isResending ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isResending ? 'Sending...' : 'Resend Invite'}
          </button>
        </div>
      )}
      
      {message && (
        <div style={{ 
          marginTop: '8px', 
          fontSize: '13px',
          padding: '6px 8px',
          borderRadius: '4px',
          backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2',
          color: message.includes('✅') ? '#166534' : '#dc2626',
          border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`
        }}>
          {message}
        </div>
      )}
    </div>
  )
}

export default ResendInviteField