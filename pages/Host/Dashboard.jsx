import React from "react"
import { Link, redirect } from "react-router-dom"
import { BsStarFill } from "react-icons/bs"
import { getHostVans, removeVanForUser } from "../../api"
import { getAuth, onAuthStateChanged } from "firebase/auth"


// fixing default logged in state
export async function requireAuth() {
    const isLoggedIn = localStorage.getItem("loggedin") // or use Firebase check
    if (!isLoggedIn) {
        throw redirect("/login")
    }
}
// 

export default function Dashboard() {
    const [vans, setVans] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

 
    React.useEffect(() => {
        setLoading(true);
        const auth = getAuth();  // <--- define auth here
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            getHostVans()
              .then(data => {
                console.log("Fetched vans:", data);
                setVans(data);
              })
              .catch(err => setError(err))
              .finally(() => setLoading(false));
          } else {
            setLoading(false);
            setError(new Error("User not authenticated"));
          }
        });
      
        return () => unsubscribe();
      }, []);

    async function handleRemoveVan(vanId) {
        try {
          setLoading(true);
          await removeVanForUser(vanId);
          const updatedVans = await getHostVans();
          setVans(updatedVans);
          
        } catch (err) {
          console.error("Failed to remove van:", err);
        } finally {
          setLoading(false);
        }
      }

    

    function renderVanElements(vans) {
        const hostVansEls = vans.map((van) => (
            <div className="host-van-single" key={van.id}>
                <img src={van.imageUrl} alt={`Photo of ${van.name}`} />
                <div className="host-van-info">
                    <h3>{van.name}</h3>
                    <p>${van.price}/day</p>
                </div>
                <Link to={`vans/${van.id}`}>View</Link>
                {/* REMOVE BUTTON */}
                <button style={{marginLeft:"10px",color:"red"}} onClick={() => handleRemoveVan(van.id)}>X</button>
            </div>
        ))

        return (
            <div className="host-vans-list">
                <section>{hostVansEls}</section>
            </div>
        )
    }

    // if (loading) {
    //     return <h1>Loading...</h1>
    // }

    if (error) {
        return <h1>Error: {error.message}</h1>
    }

    return (
        <>
            <section className="host-dashboard-earnings">
                <div className="info">
                    <h1>Welcome!</h1>
                    <p>Income last <span>30 days</span></p>
                    <h2>$2,260</h2>
                </div>
                <Link to="income">Details</Link>
            </section>
            <section className="host-dashboard-reviews">
                <h2>Review score</h2>

                <BsStarFill className="star" />

                <p>
                    <span>5.0</span>/5
                </p>
                <Link to="reviews">Details</Link>
            </section>
            <section className="host-dashboard-vans">
                <div className="top">
                    <h2>Your listed vans</h2>
                    <Link to="vans">View all</Link>
                </div>
                {
                    loading
                    ? <h1>Loading...</h1>
                    : (
                        vans.length > 0
                        ? renderVanElements(vans)
                        : <p>No vans listed.</p>
                    )
                }
            
            </section>
        </>
    )
}
