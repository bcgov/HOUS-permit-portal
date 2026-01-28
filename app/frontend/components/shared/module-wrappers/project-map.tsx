import Graphic from "@arcgis/core/Graphic"
import Map from "@arcgis/core/Map"
import "@arcgis/core/assets/esri/themes/light/main.css"
import config from "@arcgis/core/config"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import MapView from "@arcgis/core/views/MapView"
import React, { useEffect, useRef } from "react"
import { TLatLngTuple } from "../../../types/types"

interface IProjectMapProps {
  coordinates: TLatLngTuple | null
  pid?: string
}

export const ProjectMap = ({ coordinates, pid }: IProjectMapProps) => {
  const mapDiv = useRef<HTMLDivElement>(null)
  const viewRef = useRef<MapView | null>(null)
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapDiv.current) return

    if (import.meta.env.VITE_ARCGIS_API_KEY) {
      config.apiKey = import.meta.env.VITE_ARCGIS_API_KEY
    }

    const map = new Map({
      basemap: "topo-vector",
    })

    const graphicsLayer = new GraphicsLayer()
    map.add(graphicsLayer)
    graphicsLayerRef.current = graphicsLayer

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      zoom: 16, // Default zoom for a single parcel
      center: coordinates || [-123.1207, 49.2827], // Default to Vancouver if no coords
      constraints: {
        snapToZoom: false,
      },
    })

    viewRef.current = view

    // Remove zoom widget for cleaner look in small container, or keep it?
    // Card says: "Map includes basic navigation controls (zoom, pan)"
    // Default UI has zoom.

    return () => {
      if (view) {
        view.destroy()
      }
    }
  }, [])

  // Update View and Graphic when coordinates change
  useEffect(() => {
    const view = viewRef.current
    const layer = graphicsLayerRef.current
    if (!view || !layer) return

    layer.removeAll()

    if (coordinates) {
      const [lng, lat] = coordinates

      const point = {
        type: "point",
        longitude: lng,
        latitude: lat,
      } as any

      const simpleMarkerSymbol = {
        type: "simple-marker" as const, // Explicitly cast to 'simple-marker' literal type
        color: [252, 186, 25], // Orange
        outline: {
          color: [255, 255, 255], // White
          width: 1,
        },
      }

      const pointGraphic = new Graphic({
        geometry: point,
        symbol: simpleMarkerSymbol,
      })

      layer.add(pointGraphic)

      view.goTo({
        center: [lng, lat],
        zoom: 17, // Closer zoom for specific parcel
      })
    }
  }, [coordinates])

  return <div ref={mapDiv} style={{ height: "100%", width: "100%", minHeight: "300px" }} />
}
