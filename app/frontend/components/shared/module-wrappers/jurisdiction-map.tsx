import "leaflet/dist/leaflet.css"
import React, { useEffect } from "react"
import { MapContainer, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet"
import { TLatLngTuple } from "../../../types/types"

interface IJurisdictionMapProps {
  mapPosition: TLatLngTuple
  linePositions?: TLatLngTuple[]
  onMapDrag?: (newCenter: TLatLngTuple) => void
  isEditingMap?: boolean
}

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  let [lat, lng] = center
  lat ||= 0
  lng ||= 0
  center = [lat, lng] as TLatLngTuple
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

const SetMapBehaviour = ({ isEditingMap }: { isEditingMap: boolean }) => {
  const map = useMap()
  map.attributionControl.remove()

  useEffect(() => {
    if (isEditingMap) {
      map.dragging.enable()
      map.scrollWheelZoom.enable()
    } else {
      map.dragging.disable()
      map.scrollWheelZoom.disable()
    }
  }, [isEditingMap, map])

  return null // This component does not render anything itself
}

export const JurisdictionMap = ({
  mapPosition,
  linePositions,
  onMapDrag,
  isEditingMap = false,
}: IJurisdictionMapProps) => {
  return (
    <>
      <MapContainer
        dragging={isEditingMap}
        center={mapPosition}
        zoom={13}
        style={{ height: "250px", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <SetMapBehaviour isEditingMap={isEditingMap} />
        <Polyline pathOptions={{ color: "blue" }} positions={linePositions || []} />
        <MapUpdater center={mapPosition} />
        <MapDragListener onDrag={onMapDrag} />
      </MapContainer>
    </>
  )
}
