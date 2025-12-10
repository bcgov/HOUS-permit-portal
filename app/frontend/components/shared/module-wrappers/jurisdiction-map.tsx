import Graphic from "@arcgis/core/Graphic"
import Map from "@arcgis/core/Map"
import "@arcgis/core/assets/esri/themes/light/main.css"
import config from "@arcgis/core/config"
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils"
import Polyline from "@arcgis/core/geometry/Polyline"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import MapView from "@arcgis/core/views/MapView"
import React, { useEffect, useRef } from "react"
import { TLatLngTuple } from "../../../types/types"

interface IJurisdictionMapProps {
  mapPosition: TLatLngTuple
  mapZoom: number
  linePositions?: TLatLngTuple[]
  onMapDrag?: (newCenter: TLatLngTuple) => void
  onZoomChange?: (newZoom: number) => void
  isEditingMap?: boolean
}

export const JurisdictionMap = ({
  mapPosition,
  mapZoom,
  linePositions,
  onMapDrag,
  onZoomChange,
  isEditingMap = false,
}: IJurisdictionMapProps) => {
  const mapDiv = useRef<HTMLDivElement>(null)
  const viewRef = useRef<MapView | null>(null)
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null)
  const isUpdatingRef = useRef(false)
  const propsRef = useRef({ onMapDrag, onZoomChange, isEditingMap })

  // Keep props ref updated
  useEffect(() => {
    propsRef.current = { onMapDrag, onZoomChange, isEditingMap }
  }, [onMapDrag, onZoomChange, isEditingMap])

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

    // ArcGIS uses [lng, lat], which is now stored correctly in the DB
    const center = mapPosition

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: center,
      zoom: mapZoom,
      ui: {
        components: ["attribution"], // Start with minimal UI
      },
      constraints: {
        snapToZoom: false,
      },
    })

    viewRef.current = view

    // Watch for stationary state to trigger callbacks (drag end / zoom end)
    const handle = reactiveUtils.watch(
      () => view.stationary,
      (stationary) => {
        if (stationary && !isUpdatingRef.current) {
          const { onMapDrag, onZoomChange, isEditingMap } = propsRef.current
          // Only trigger callbacks if we are in editing mode
          if (isEditingMap) {
            if (onMapDrag) {
              const { latitude, longitude } = view.center
              // Save as [longitude, latitude] to match DB format
              onMapDrag([longitude, latitude])
            }
            if (onZoomChange) {
              onZoomChange(view.zoom)
            }
          }
        }
      }
    )

    return () => {
      handle.remove()
      if (view) {
        view.destroy()
      }
    }
  }, [])

  // Update View Props (center, zoom)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const [lng, lat] = mapPosition
    const currentCenter = view.center

    // Calculate differences to decide if we need to update
    const latDiff = Math.abs(currentCenter.latitude - lat)
    const lngDiff = Math.abs(currentCenter.longitude - lng)
    const zoomDiff = Math.abs(view.zoom - mapZoom)

    // Thresholds to avoid loops
    if (latDiff > 0.0001 || lngDiff > 0.0001 || zoomDiff > 0.1) {
      isUpdatingRef.current = true
      view
        .goTo({
          center: [lng, lat],
          zoom: mapZoom,
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Map update failed", err)
          }
        })
        .finally(() => {
          // Small delay to ensure stationary event doesn't trigger loop immediately
          setTimeout(() => {
            isUpdatingRef.current = false
          }, 100)
        })
    }
  }, [mapPosition, mapZoom])

  // Update Polyline
  useEffect(() => {
    const layer = graphicsLayerRef.current
    if (!layer) return

    layer.removeAll()
    if (linePositions && linePositions.length > 0) {
      // Data is already [lng, lat] from DB
      const paths = linePositions

      const polyline = new Polyline({
        paths: [paths],
      })

      const graphic = new Graphic({
        geometry: polyline,
        symbol: {
          type: "simple-line",
          color: "blue",
          width: 3,
        },
      })

      layer.add(graphic)
    }
  }, [linePositions])

  // Manage Interactivity based on isEditingMap
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const stopPropagation = (event: any) => {
      // If NOT editing, stop all map interactions
      if (!isEditingMap) {
        event.stopPropagation()
      }
    }

    if (isEditingMap) {
      // Enable interactions (default behavior)
      view.ui.add("zoom", "top-left")
    } else {
      // Disable interactions manually since navigation properties are deprecated/removed
      // We already have event listeners below that call stopPropagation() when !isEditingMap
      view.ui.remove("zoom")
    }

    const dragHandle = view.on("drag", stopPropagation)
    const keyHandle = view.on("key-down", stopPropagation)
    const wheelHandle = view.on("mouse-wheel", stopPropagation)
    const doubleClickHandle = view.on("double-click", stopPropagation)

    return () => {
      dragHandle.remove()
      keyHandle.remove()
      wheelHandle.remove()
      doubleClickHandle.remove()
    }
  }, [isEditingMap])

  return <div ref={mapDiv} style={{ height: "250px", width: "100%", zIndex: 0 }} />
}
