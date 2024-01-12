import { Center } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"

export const Footer = observer(() => {
  const location = useLocation()
  const { userStore, sessionStore } = useMst()
  const { currentUser } = userStore
  const excludeFooterRoutes = ["/reset-password", "/accept-invitation", "/login", "/forgot-password", "/register"]

  const shouldShowFooter =
    (!sessionStore.loggedIn && !excludeFooterRoutes.includes(location.pathname)) ||
    currentUser?.role === EUserRoles.submitter

  return (
    <>
      {shouldShowFooter && (
        <Center as="footer" w="full" h="250px" bg="greys.grey02" justifySelf="flex-end">
          FOOTER
        </Center>
      )}
    </>
  )
})
