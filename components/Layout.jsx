import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"


export default function Layout() {
    const location = useLocation()
    const isHomePage = location.pathname === "/"

    return (
        <div className="site-wrapper">
            <Header />
            <main className={isHomePage ? "no-margin" : ""}>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}