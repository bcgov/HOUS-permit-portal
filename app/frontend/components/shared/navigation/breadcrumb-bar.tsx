import { Breadcrumb, BreadcrumbItem, Container, Flex } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { isUUID } from "../../../utils/utility-funcitons"
import { NAVBAR_HEIGHT } from "../../domains/navigation/nav-bar"
import { RouterLinkButton } from "./router-link-button"

export const BreadcrumbBar = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const path = location.pathname

  const [breadcrumbs, setBreadcrumbs] = useState([])

  useEffect(() => {
    // Get the current path and split into segments
    // Filter out empty segments
    const pathSegments = path.split("/").filter(Boolean)

    // Create breadcrumb segments
    const breadcrumbSegments = pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/")
      return { segment, href }
    })

    setBreadcrumbs(breadcrumbSegments)
  }, [path])
  return path === "/" ? (
    <></>
  ) : (
    <Flex
      w="full"
      bg="greys.white"
      h="46px"
      align="center"
      position="sticky"
      top={NAVBAR_HEIGHT}
      zIndex={9}
      borderBottom="1px solid"
      borderColor="border.light"
      overflow="hidden"
    >
      <Container minW="container.lg">
        <Breadcrumb>
          <BreadcrumbItem>
            <RouterLinkButton variant="link" to="/" textTransform="capitalize">
              {t("site.home")}
            </RouterLinkButton>
          </BreadcrumbItem>
          {breadcrumbs.map((breadcrumb, index) => (
            <BreadcrumbItem key={index}>
              <RouterLinkButton variant="link" to={breadcrumb.href} textTransform="capitalize">
                {isUUID(breadcrumb.segment)
                  ? "todo: replace UUID" || breadcrumb.segment
                  : segmentToTitle(breadcrumb.segment)}
              </RouterLinkButton>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </Container>
    </Flex>
  )
}

export const segmentToTitle = (segment) => {
  return (
    {
      // "jurisdictions": "Local Jurisdictions",
    }[segment] || decodeURIComponent(segment).replace(/[_-]/g, " ")
  )
}
