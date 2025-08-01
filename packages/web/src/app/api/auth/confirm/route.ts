import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supabaseId } = body;

    if (!supabaseId) {
      return NextResponse.json(
        { error: 'Supabase ID is required' },
        { status: 400 }
      );
    }

    // Find user by supabaseId and update isConfirmed
    const response = await fetch(`${PAYLOAD_API_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const usersData = await response.json();
    const user = usersData.docs.find((u: any) => u.supabaseId === supabaseId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user confirmation status
    const updateResponse = await fetch(`${PAYLOAD_API_URL}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isConfirmed: true,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update user');
    }

    const updatedUser = await updateResponse.json();

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.error('Error confirming user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}