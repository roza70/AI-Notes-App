import React from 'react'
import axios from 'axios'

const Signup = () => {
    const [name, setName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Handle form submission logic here
        try{
            const response = await axios.post(
                'http://localhost:5000/api/auth/register', 
                {
                    name,
                    email,
                    password
                }
            );
            console.log(response)
            // const data = await response.data
            // Handle successful signup logic here
        } catch (error) {
            // Handle signup error logic here
            console.log(error)
        }
    };

    return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="border shadow p-6 w-80 bg-white">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit}> 
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border"
              placeholder="Enter Username"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            />
          </div>
          <div className="mb-4">
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 transition duration-300"
            >
              Signup
            </button>
            <p className="text-center mt-4">
              Already have an account?{' '}
              <a href="/login" className="text-teal-600 hover:underline">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
