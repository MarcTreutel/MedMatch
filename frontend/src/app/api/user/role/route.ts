import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, auth0Id, email, name } = body;

    console.log('User role saved:', { role, auth0Id, email, name });

    return NextResponse.json({ 
      success: true, 
      user: { role, auth0Id, email, name }
    });
  } catch (error) {
    console.error('Error saving user role:', error);
    return NextResponse.json(
      { error: 'Failed to save user role' },
      { status: 500 }
    );
  }
}
