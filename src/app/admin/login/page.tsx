import { verifyAdminCredentials, setAdminSession, isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  if (isAdminAuthenticated()) redirect('/admin')
  
  async function login(formData: FormData) {
    'use server'
    const email = (formData.get('email') || '').toString()
    const password = (formData.get('password') || '').toString()
    
    console.log('Login attempt:', { email, hasPassword: !!password })
    
    const ok = await verifyAdminCredentials(email, password)
    console.log('Authentication result:', ok)
    
    if (ok) {
      setAdminSession()
      redirect('/admin')
    }
    redirect('/admin/login?error=1')
  }
  
  return (
    <section className="max-w-sm mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      
      {searchParams.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">Invalid email or password. Please try again.</p>
        </div>
      )}
      
      <form action={login} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
          />
        </div>
        <button className="btn btn-primary w-full" type="submit">
          Log in
        </button>
      </form>
      
      <div className="text-xs text-gray-500 space-y-2">
        <p>Only the site owner is allowed to access the admin dashboard.</p>
        <p>Make sure you have set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.</p>
      </div>
    </section>
  )
}

