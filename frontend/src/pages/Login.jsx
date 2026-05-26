import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/navbar.jsx'
import { apiFetch } from '../utils/api.js'
import { useToast } from '../context/ToastContext.jsx'

const Login = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  React.useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/home', { replace: true })
    }
  }, [navigate])

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        const errMsg = data.message || 'Login failed';
        setError(errMsg)
        showToast(errMsg, 'error')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      showToast('Logged in successfully!', 'success')
      navigate('/home', { replace: true })
    } catch {
      setError('Could not reach the server. Is the backend running?')
      showToast('Could not reach the server. Is the backend running?', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center py-12 px-4">
      <div className="border shadow p-6 w-80 bg-white">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border"
              placeholder="Enter password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 transition duration-300 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center mt-4">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-teal-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
      </div>
    </div>
  )
}

export default Login
