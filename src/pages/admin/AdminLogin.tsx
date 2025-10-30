import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAdmin } from '../../contexts/AdminContext'
import { getLogoUrl } from '../../lib/assets'
import { Eye, EyeOff } from 'lucide-react'

const AdminLogin: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading, checkAdminStatus } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !adminLoading && user && isAdmin) {
      console.log('✅ User already logged in as admin, redirecting to dashboard')
      navigate('/admin', { replace: true })
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Admin login attempt:', email)

      await signIn(email, password)
      console.log('✅ Sign in successful')

      await new Promise(resolve => setTimeout(resolve, 1000))

      const adminStatus = await checkAdminStatus()
      console.log('👤 Admin status:', adminStatus)

      if (!adminStatus) {
        setError('You do not have admin access. Please contact an administrator.')
        setLoading(false)
        return
      }

      console.log('🔄 Redirecting to admin dashboard')
      navigate('/admin', { replace: true })
    } catch (error: any) {
      console.error('❌ Login error:', error)
      setError(error.message || 'Invalid email or password')
      setLoading(false)
    }
  }

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center mb-8">
            <img
              src={getLogoUrl()}
              alt="TVSHOWup"
              className="h-11"
            />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Admin Panel Login
          </h2>
          <p className="mt-2 text-center text-sm text-yellow-400">
            Please sign in with your admin credentials
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your admin email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-md p-3">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Admin access only. Unauthorized access attempts are logged.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
