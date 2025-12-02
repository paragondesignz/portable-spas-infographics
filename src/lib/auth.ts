import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'psnz-auth';
const AUTH_COOKIE_VALUE = 'authenticated';

export async function validatePassword(password: string): Promise<boolean> {
  const correctPassword = process.env.APP_PASSWORD;
  if (!correctPassword) {
    console.error('APP_PASSWORD environment variable not set');
    return false;
  }
  return password === correctPassword;
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === AUTH_COOKIE_VALUE;
}
