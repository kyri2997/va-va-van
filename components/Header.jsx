import React from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import imageUrl from "/assets/images/avatar-icon.png"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"

export default function Header() {
    const [user, setUser] = React.useState(null)
    const navigate = useNavigate()

    // Watch for auth changes
    React.useEffect(() => {
        const auth = getAuth()
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
        })

        // Cleanup on unmount
        return unsubscribe
    }, [])

    const activeStyles = {
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#161616"
    }

    // Log out user
    function handleLogout() {
        const auth = getAuth()
        signOut(auth).then(() => {
            setUser(null)
            localStorage.removeItem("loggedin") // clean up any manual auth flag
            navigate("/") // optional: redirect to home
        })
    }

    return (
        <header>
            <Link className="site-logo" to="/">Va Va Van</Link>
            <nav>
                <NavLink
                    to="/host"
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    Host
                </NavLink>
                <NavLink
                    to="/about"
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    About
                </NavLink>
                <NavLink
                    to="/vans"
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    Vans
                </NavLink>

                {/* Conditional avatar link */}
                <Link to={user ? "/host" : "/login"} className="login-link">
                    <img
                        src={imageUrl}
                        className="login-icon"
                        alt="User avatar"
                    />
                </Link>

                {/* Show logout button only when user is signed in */}
                {user && (
                    <button onClick={handleLogout} className="logout-button">
                        Log out
                    </button>
                )}
            </nav>
        </header>
    )
}
