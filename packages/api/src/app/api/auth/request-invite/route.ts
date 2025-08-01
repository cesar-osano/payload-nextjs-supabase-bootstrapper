import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadHMR({ config: configPromise })
    
    // Find user by email
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      )
    }

    const user = users.docs[0]

    if (user.isConfirmed) {
      return NextResponse.json(
        { error: 'Account is already confirmed. Try resetting your password instead.' },
        { status: 400 }
      )
    }

    // Delete the existing Supabase user if they exist (to reset their state)
    if (user.supabaseId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.supabaseId)
      } catch (deleteError) {
        console.log('User may not exist in Supabase, continuing with invite...')
      }
    }

    // Send new invite
    const { data: supabaseData, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(user.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:5000'}/auth/set-password`,
      data: {
        displayName: user.name || user.email,
      },
    })

    if (error) {
      console.error('Supabase invite error:', error)
      return NextResponse.json(
        { error: `Failed to send invite: ${error.message}` },
        { status: 500 }
      )
    }

    // Update the user with new Supabase ID
    if (supabaseData?.user?.id) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          supabaseId: supabaseData.user.id,
          isConfirmed: false,
        },
      })
    }

    return NextResponse.json({
      message: 'Invite sent successfully',
      email: user.email,
    })
    
  } catch (error) {
    console.error('Error requesting invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}