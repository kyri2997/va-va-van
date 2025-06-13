import React from "react"
import { Link, useParams, useLocation, useNavigate } from "react-router-dom"
import { getVan, saveVanForUser } from "../../api"
import { getAuth, onAuthStateChanged } from "firebase/auth"

export default function VanDetail() {
    const [van, setVan] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [user, setUser] = React.useState(null) // track logged-in user
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    React.useEffect(() => {
        const auth = getAuth()
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser) // will be null if logged out
        })
        return unsubscribe // clean up listener on unmount
    }, [])

    React.useEffect(() => {
        async function loadVan() {
            setLoading(true)
            try {
                const data = await getVan(id)
                setVan(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        loadVan()
    }, [id])

    async function handleRentClick() {
  

        if (!user) {
            // Redirect to login, pass info to come back and save this van after login
            navigate("/login", {
                state: { from: `/vans/${id}`, addVanId: id }
            })
        } else {
            // User is logged in, save van immediately
            try {
                await saveVanForUser(id)
                alert("Van added to your list!")
            } catch (err) {
                alert("Failed to add van to your list. Please log in and try again.")
            }
        }
    }

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (error) {
        return <h1>There was an error: {error.message}</h1>
    }

    const search = location.state?.search || ""
    const type = location.state?.type || "all"

    return (
        <div className="van-detail-container">
            <Link
                to={`..${search}`}
                relative="path"
                className="back-button"
            >
                &larr; <span>Back to {type} vans</span>
            </Link>

            {van && (
                <div className="van-detail">
                    <img src={van.imageUrl} alt={van.name} />
                    <i className={`van-type ${van.type} selected`}>{van.type}</i>
                    <h2>{van.name}</h2>
                    <p className="van-price">
                        <span>${van.price}</span>/day
                    </p>
                    <p>{van.description}</p>
                    <button className="link-button" onClick={handleRentClick}>
                        Rent this van
                    </button>
                </div>
            )}
        </div>
    )
}
