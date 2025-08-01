import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    
    // Get the user from Payload
    const user = await payload.findByID({
      collection: 'users',
      id: params.id,
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.isConfirmed) {
      return NextResponse.json(
        { error: 'User has already confirmed their account' },
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
        id: params.id,
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
    console.error('Error resending invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}