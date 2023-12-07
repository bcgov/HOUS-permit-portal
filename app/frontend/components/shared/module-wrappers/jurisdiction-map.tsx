import "leaflet/dist/leaflet.css"
import React from "react"
import { MapContainer, Polyline, TileLayer } from "react-leaflet"
import { TLatLngTuple } from "../../../types/types"

interface IJurisdictionMapProps {
  mapPosition: TLatLngTuple
  linePositions: TLatLngTuple[]
}

export const JurisdictionMap = ({ mapPosition, linePositions }: IJurisdictionMapProps) => {
  return (
    <MapContainer center={mapPosition} zoom={13} style={{ height: "250px", width: "100%", zIndex: 0 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline pathOptions={{ color: "blue" }} positions={linePositions} />
    </MapContainer>
  )
}
