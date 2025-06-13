import React, { useEffect, useState } from "react"
import { Outlet, Navigate, useLocation } from "react-router-dom"
import { getAuth, onAuthStateChanged } from "firebase/auth"

export default function AuthRequired() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    // You can customize the loading UI here
    return <h2>Checking authentication...</h2>
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          message: "You must log in first",
          from: location.pathname,
        }}
        replace
      />
    )
  }

  return <Outlet />
}
