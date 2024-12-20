import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useMst } from "../setup/root" // Adjust the path as needed

const useSyncPathWithStore = () => {
  const location = useLocation()
  const rootStore = useMst()

  useEffect(() => {
    rootStore.updatePath(location.pathname)
  }, [location.pathname, rootStore]) // Include rootStore to ensure it’s part of the dependency array
}

export default useSyncPathWithStore
