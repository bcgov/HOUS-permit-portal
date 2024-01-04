import { Breadcrumb, BreadcrumbItem, Container, Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { isUUID } from "../../../utils/utility-funcitons"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { NAVBAR_HEIGHT } from "./nav-bar"

export const SubNavBar = observer(() => {
  const { sessionStore } = useMst()
  const { loggedIn } = sessionStore

  const location = useLocation()
  const path = location.pathname

  return path === "/" ? (
    loggedIn ? (
      <HomeSubNav />
    ) : (
      <></>
    )
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
        <DynamicBreadcrumb path={path} />
      </Container>
    </Flex>
  )
})

const HomeSubNav = () => {
  const { t } = useTranslation()

  return (
    <Flex w="full" gap={8} bg="greys.white">
      <RouterLinkButton to={"#"} variant="tertiary">
        {t("site.activePermits")}
      </RouterLinkButton>
      <RouterLinkButton to={"#"} variant="tertiary">
        {t("site.approvedPermits")}
      </RouterLinkButton>
      <RouterLinkButton to={"#"} variant="tertiary">
        {t("site.myAccount")}
      </RouterLinkButton>
      <RouterLinkButton to={"#"} variant="tertiary">
        {t("site.giveFeedback")}
      </RouterLinkButton>
    </Flex>
  )
}

interface IDynamicBreadcrumbProps {
  path: string
}

const DynamicBreadcrumb = ({ path }: IDynamicBreadcrumbProps) => {
  const { t } = useTranslation()

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

  return (
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
  )
}

export const segmentToTitle = (segment) => {
  return (
    {
      // "jurisdictions": "Local Jurisdictions",
    }[segment] || decodeURIComponent(segment).replace(/[_-]/g, " ")
  )
}
