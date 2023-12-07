import { Center } from "@chakra-ui/react"
import React from "react"
import { useLocation } from "react-router-dom"

export const Footer = () => {
  const location = useLocation()
  const excludeFooterRoutes = ["/reset-password", "/login", "/forgot-password", "/register"]
  const shouldShowFooter = !excludeFooterRoutes.includes(location.pathname)

  return (
    <>
      {shouldShowFooter && (
        <Center as="footer" w="full" h="250px" bg="greys.grey02" justifySelf="flex-end">
          FOOTER
        </Center>
      )}
    </>
  )
}
