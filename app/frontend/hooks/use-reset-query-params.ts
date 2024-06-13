import { useLocation, useNavigate } from "react-router-dom"

export const useResetQueryParams = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return () => {
    const urlParams = new URLSearchParams(location.search)

    // Clear all parameters
    urlParams.forEach((_, key) => {
      urlParams.delete(key)
    })

    // Update the URL without parameters
    navigate(
      {
        pathname: location.pathname,
        search: urlParams.toString(),
      },
      { replace: true }
    )
  }
}
