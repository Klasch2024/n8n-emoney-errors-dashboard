import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear auth cookies
  response.cookies.delete('isAuthenticated');
  response.cookies.delete('userEmail');
  
  return response;
}

