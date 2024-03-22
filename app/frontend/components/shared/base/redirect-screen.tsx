import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LoadingScreen } from "./loading-screen"

interface IRedirectScreenProps {
  path?: string
}

export const RedirectScreen = observer(({ path = null }: IRedirectScreenProps) => {
  /*
    This screen is used as a placeholder for links that appear in the breadcrumbs but dont have pages implemented
    (ie when a review manager clicks /jurisdictions) - it is also optionally used when you want to redirect to a
    spcific path for a given route.
  */

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const currentPath = location.pathname
    const pathSegments = currentPath.split("/").filter(Boolean) // Remove empty segments, especially the first one if path starts with '/'
    pathSegments.pop() // Remove the last segment
    const newPath = path ?? `/${pathSegments.join("/")}`
    navigate(newPath, { replace: true }) // Navigate to the new path
  }, [navigate, location.pathname])

  return <LoadingScreen />
})
