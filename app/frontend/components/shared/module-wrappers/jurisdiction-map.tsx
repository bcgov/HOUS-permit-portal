import "leaflet/dist/leaflet.css"
import React from "react"
import { MapContainer, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet"
import { TLatLngTuple } from "../../../types/types"

interface IJurisdictionMapProps {
  mapPosition: TLatLngTuple
  linePositions?: TLatLngTuple[]
  onMapDrag?: (newCenter: TLatLngTuple) => void
}

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap()
  const currentCenter = map.getCenter()
  const distance = map.distance(currentCenter, center)
  if (distance > 10) {
    map.setView(center)
  }
  return null
}

// Component to listen for map drag events
const MapDragListener: React.FC<{ onDrag: (newCenter: [number, number]) => void }> = ({ onDrag }) => {
  useMapEvents({
    moveend: (e) => {
      const newCenter = e.target.getCenter()
      onDrag && onDrag([newCenter.lat, newCenter.lng])
    },
  })
  return null
}

export const JurisdictionMap = ({ mapPosition, linePositions, onMapDrag }: IJurisdictionMapProps) => {
  return (
    <>
      <MapContainer center={mapPosition} zoom={13} style={{ height: "250px", width: "100%", zIndex: 0 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline pathOptions={{ color: "blue" }} positions={linePositions || []} />
        <MapUpdater center={mapPosition} />
        <MapDragListener onDrag={onMapDrag} />
      </MapContainer>
    </>
  )
}
