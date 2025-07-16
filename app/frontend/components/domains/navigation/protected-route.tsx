import { observer } from "mobx-react-lite"
import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"

interface IProps {
  isAllowed: boolean
  redirectPath?: string
  children?: JSX.Element
}
export const ProtectedRoute = observer(({ isAllowed, redirectPath = "/login", children }: IProps) => {
  const location = useLocation()
  const { sessionStore } = useMst()
  const { setAfterLoginPath } = sessionStore

  if (!isAllowed) {
    if (!sessionStore.loggedIn) setAfterLoginPath(location.pathname)
    return <Navigate to={redirectPath || "/login"} replace />
  }

  return children ? children : <Outlet />
})
