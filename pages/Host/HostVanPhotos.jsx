import React from "react"
import { useOutletContext } from "react-router-dom"
import { getAuth } from "firebase/auth"


export default function HostVanPhotos() {
    const { currentVan } = useOutletContext()
    return (
        <img src={currentVan.imageUrl} className="host-van-detail-image" />
    )
}