import { cookies } from 'next/headers'

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || ''
  const adminPassword = process.env.ADMIN_PASSWORD || ''
  
  console.log('Auth debug:', {
    hasAdminEmail: !!adminEmail,
    hasPassword: !!adminPassword,
    emailLength: adminEmail.length,
    passwordLength: adminPassword.length,
    inputEmail: email,
    inputPasswordLength: password.length
  })
  
  if (!adminEmail || !adminPassword) {
    console.log('Missing env vars')
    return false
  }
  
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
    console.log('Email mismatch:', { input: email.trim().toLowerCase(), expected: adminEmail.trim().toLowerCase() })
    return false
  }
  
  if (password !== adminPassword) {
    console.log('Password mismatch')
    return false
  }
  
  console.log('Authentication successful')
  return true
}

export function setAdminSession() {
  const cookieStore = cookies()
  cookieStore.set('admin_session', '1', { path: '/', httpOnly: true })
}

export function clearAdminSession() {
  const cookieStore = cookies()
  cookieStore.set('admin_session', '', { path: '/', httpOnly: true, maxAge: 0 })
}

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies()
  const val = cookieStore.get('admin_session')?.value
  return val === '1'
}

