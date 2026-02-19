import Graphic from "@arcgis/core/Graphic"
import Map from "@arcgis/core/Map"
import "@arcgis/core/assets/esri/themes/light/main.css"
import config from "@arcgis/core/config"
import Polygon from "@arcgis/core/geometry/Polygon"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol"
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol"
import MapView from "@arcgis/core/views/MapView"
import { Box, Center, IconButton, Text } from "@chakra-ui/react"
import { ArrowsOut, MapTrifold, Warning } from "@phosphor-icons/react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { IParcelGeometry, TLatLngTuple } from "../../../types/types"
import { SharedSpinner } from "../base/shared-spinner"

interface IProjectMapProps {
  coordinates: TLatLngTuple | null
  pid?: string | null
  parcelGeometry?: IParcelGeometry | null
  onOpenFullscreen?: () => void
}

const PARCEL_FILL_COLOR = [66, 133, 244, 0.2] // Semi-transparent blue
const PARCEL_OUTLINE_COLOR = [66, 133, 244, 1] // Solid blue
const PARCEL_OUTLINE_WIDTH = 2
const MARKER_COLOR = [252, 186, 25] // Orange
const MARKER_OUTLINE_COLOR = [255, 255, 255] // White
const DEFAULT_CENTER: TLatLngTuple = [-123.1207, 49.2827] // Vancouver
const DEFAULT_ZOOM = 15
const PARCEL_ZOOM = 16

export const ProjectMap = ({ coordinates, pid, parcelGeometry, onOpenFullscreen }: IProjectMapProps) => {
  const { t } = useTranslation()
  const mapDiv = useRef<HTMLDivElement>(null)
  const viewRef = useRef<MapView | null>(null)
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null)

  const [isMapReady, setIsMapReady] = useState(false)
  const [hasError, setHasError] = useState(false)

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
      zoom: DEFAULT_ZOOM,
      center: coordinates || DEFAULT_CENTER,
      constraints: {
        snapToZoom: false,
      },
    })

    viewRef.current = view

    view
      .when(() => {
        setIsMapReady(true)
        setHasError(false)
      })
      .catch((err: Error) => {
        console.error("MapView failed to load:", err)
        setHasError(true)
      })

    return () => {
      if (view) {
        view.destroy()
      }
    }
  }, [])

  // Build graphics from props
  const updateGraphics = useCallback(() => {
    const view = viewRef.current
    const layer = graphicsLayerRef.current
    if (!view || !layer) return

    layer.removeAll()

    // Draw parcel polygon if geometry is available
    if (parcelGeometry?.rings?.length) {
      const polygon = new Polygon({
        rings: parcelGeometry.rings,
        spatialReference: { wkid: 4326 },
      })

      const fillSymbol = new SimpleFillSymbol({
        color: PARCEL_FILL_COLOR as any,
        outline: {
          color: PARCEL_OUTLINE_COLOR as any,
          width: PARCEL_OUTLINE_WIDTH,
        },
      })

      const polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: fillSymbol,
      })

      layer.add(polygonGraphic)

      // Zoom to fit the parcel boundary with some padding
      view.goTo(polygon.extent.expand(1.5)).catch(() => {
        // Silently handle animation interruption (e.g. user interaction during goTo)
      })
    } else if (coordinates) {
      // Fallback: just show point marker and zoom to it
      const [lng, lat] = coordinates

      view
        .goTo({
          center: [lng, lat],
          zoom: PARCEL_ZOOM,
        })
        .catch(() => {})
    }

    // Always show a point marker at the centroid if we have coordinates
    if (coordinates) {
      const [lng, lat] = coordinates

      const point = {
        type: "point",
        longitude: lng,
        latitude: lat,
      } as any

      const markerSymbol = new SimpleMarkerSymbol({
        color: MARKER_COLOR as any,
        size: 10,
        outline: {
          color: MARKER_OUTLINE_COLOR as any,
          width: 1,
        },
      })

      const pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
      })

      layer.add(pointGraphic)
    }
  }, [coordinates, parcelGeometry])

  // Update graphics when coordinates or parcel geometry change
  useEffect(() => {
    if (!isMapReady) return
    updateGraphics()
  }, [isMapReady, updateGraphics])

  // Error state
  if (hasError) {
    return (
      <Center
        h="100%"
        w="100%"
        minH={{ base: "200px", lg: "300px" }}
        bg="greys.grey03"
        borderRadius="md"
        flexDirection="column"
        gap={2}
      >
        <Warning size={32} />
        <Text fontSize="sm" color="text.secondary" textAlign="center">
          {t("permitProject.map.errorLoading")}
        </Text>
      </Center>
    )
  }

  // No location data state
  if (!coordinates && !parcelGeometry && pid) {
    return (
      <Center
        h="100%"
        w="100%"
        minH={{ base: "200px", lg: "300px" }}
        bg="greys.grey03"
        borderRadius="md"
        flexDirection="column"
        gap={2}
      >
        <MapTrifold size={32} />
        <Text fontSize="sm" color="text.secondary" textAlign="center">
          {t("permitProject.map.noLocation")}
        </Text>
      </Center>
    )
  }

  return (
    <Box position="relative" h="100%" w="100%" minH={{ base: "200px", lg: "300px" }}>
      {/* Loading overlay */}
      {!isMapReady && (
        <Center position="absolute" inset={0} bg="greys.grey03" zIndex={1} borderRadius="md">
          <SharedSpinner my={0} />
        </Center>
      )}

      {/* Fullscreen button */}
      {onOpenFullscreen && isMapReady && (
        <IconButton
          aria-label={t("permitProject.map.openFullscreen")}
          icon={<ArrowsOut size={18} />}
          size="sm"
          position="absolute"
          top={2}
          right={2}
          zIndex={1}
          bg="white"
          shadow="md"
          borderRadius="md"
          _hover={{ bg: "gray.100" }}
          onClick={onOpenFullscreen}
        />
      )}

      <Box
        ref={mapDiv}
        h="100%"
        w="100%"
        borderRadius="md"
        role="application"
        aria-label={pid ? t("permitProject.map.ariaLabelWithPid", { pid }) : t("permitProject.map.ariaLabel")}
      />
    </Box>
  )
}
