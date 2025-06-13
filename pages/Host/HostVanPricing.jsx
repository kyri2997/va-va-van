// This component displays the pricing information for a van in a host's dashboard.

import React from "react"
import { useOutletContext } from "react-router-dom"

export default function HostVanPricing() {
    const { currentVan } = useOutletContext()
    
    if (!currentVan) {
        return <h3>Loading pricing...</h3>
    }
    return (
        <h3 className="host-van-price">${currentVan.price}<span>/day</span></h3>
    )
}

