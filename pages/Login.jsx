import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { loginUser, saveVanForUser } from "../api"  // Make sure you have this API function

export default function Login() {
    const [loginFormData, setLoginFormData] = React.useState({ email: "", password: "" })
    const [status, setStatus] = React.useState("idle")
    const [error, setError] = React.useState(null)

    const location = useLocation()
    const navigate = useNavigate()

    // Where to redirect after login
    const from = location.state?.from || "/host";
    // Van ID to add after login (optional)
    const addVanId = location.state?.addVanId;

    async function handleSubmit(e) {
        e.preventDefault()
        setStatus("submitting")
        try {
            const data = await loginUser(loginFormData)
            setError(null)
            localStorage.setItem("loggedin", true)

            // If there's a van to save (user clicked rent before login)
            if (addVanId) {
                try {
                    await saveVanForUser(addVanId)
                } catch (saveError) {
                    console.error("Failed to save van after login:", saveError)
                    // Optionally notify the user or ignore failure silently
                }
            }

            navigate(from, { replace: true })
        } catch (err) {
            setError(err)
        } finally {
            setStatus("idle")
        }
    }

    function handleChange(e) {
        const { name, value } = e.target
        setLoginFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="login-container">
            {
                location.state?.message &&
                    <h3 className="login-error">{location.state.message}</h3>
            }
            <h1>Sign in to your account</h1>
            <p style={{color:"red"}}>*Please use the following to test sign in - User: b@b.com, PW: p12345 *</p>
            {
                error?.message &&
                    <h3 className="login-error">{error.message}</h3>
            }

            <form onSubmit={handleSubmit} className="login-form">
                <input
                    name="email"
                    onChange={handleChange}
                    type="email"
                    placeholder="Email address"
                    value={loginFormData.email}
                />
                <input
                    name="password"
                    onChange={handleChange}
                    type="password"
                    placeholder="Password"
                    value={loginFormData.password}
                />
                <button
                    disabled={status === "submitting"}
                >
                    {status === "submitting"
                        ? "Logging in..."
                        : "Log in"
                    }
                </button>
            </form>
        </div>
    )
}
