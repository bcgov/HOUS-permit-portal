import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Container, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { isUUID, toCamelCase } from "../../../utils/utility-funcitons"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const SubNavBar = observer(() => {
  const location = useLocation()
  const path = location.pathname

  return (
    <Flex
      w="full"
      bg="greys.white"
      h="46px"
      align="center"
      position="sticky"
      zIndex={9}
      borderBottom="1px solid"
      borderColor="border.light"
      overflow="hidden"
    >
      <Container minW="container.lg" px={8}>
        <DynamicBreadcrumb path={path} />
      </Container>
    </Flex>
  )
})

interface IDynamicBreadcrumbProps {
  path: string
}

const DynamicBreadcrumb = observer(({ path }: IDynamicBreadcrumbProps) => {
  const { t } = useTranslation()
  const rootStore = useMst()

  const [breadcrumbs, setBreadcrumbs] = useState([])

  useEffect(() => {
    // Get the current path and split into segments
    // Filter out empty segments
    const pathSegments = path.split("/").filter(Boolean)

    // Create breadcrumb segments
    const breadcrumbSegments = pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/")
      const resourceNeeded = isUUID(segment)
      const previousSegment = pathSegments[index - 1]

      const currentResourceMap = {
        jurisdictions: rootStore.jurisdictionStore.currentJurisdiction?.name,
      }

      const title = resourceNeeded
        ? currentResourceMap[previousSegment] || segment
        : //@ts-ignore
          t(`site.breadcrumb.${toCamelCase(segment)}`)

      return { segment, href, title }
    })

    setBreadcrumbs(breadcrumbSegments)
  }, [path, rootStore.jurisdictionStore.currentJurisdiction])

  return (
    <Breadcrumb spacing={2} separator="/" mt={4}>
      <BreadcrumbItem>
        <BreadcrumbLink as={RouterLinkButton} to="/" textTransform="capitalize" variant="link">
          {t("site.home")}
        </BreadcrumbLink>
      </BreadcrumbItem>

      {breadcrumbs.map((breadcrumb, index) => {
        const finalSegment = index == breadcrumbs.length - 1
        return (
          <BreadcrumbItem key={index}>
            {finalSegment ? (
              <Text fontWeight="bold">{breadcrumb.title}</Text>
            ) : (
              <BreadcrumbLink as={RouterLinkButton} to={breadcrumb.href} variant="link">
                {breadcrumb.title}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
})
