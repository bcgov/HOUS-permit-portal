import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Container, Flex, FlexProps, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { isUUID, toCamelCase } from "../../../utils/utility-functions"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

type TBreadcrumbSegment = { href: string; title: string }

interface ISubNavBar extends FlexProps {
  breadCrumbContainerProps?: FlexProps
  staticBreadCrumbs?: TBreadcrumbSegment[]
}

export const SubNavBar = observer(({ staticBreadCrumbs, breadCrumbContainerProps, ...containerProps }: ISubNavBar) => {
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
      {...containerProps}
    >
      <Container minW="container.lg" px={8} {...breadCrumbContainerProps}>
        {Array.isArray(staticBreadCrumbs) ? (
          <SiteBreadcrumbs breadcrumbs={staticBreadCrumbs} />
        ) : (
          <DynamicBreadcrumb path={path} />
        )}
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

  const [breadcrumbs, setBreadcrumbs] = useState<TBreadcrumbSegment[]>([])

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
        "permit-applications": rootStore.permitApplicationStore.currentPermitApplication?.number,
      }

      const title = resourceNeeded
        ? currentResourceMap[previousSegment] || segment
        : //@ts-ignore
          t(`site.breadcrumb.${toCamelCase(segment)}`)

      return { href, title }
    })

    setBreadcrumbs(breadcrumbSegments)
  }, [path, rootStore.jurisdictionStore.currentJurisdiction])

  return <SiteBreadcrumbs breadcrumbs={breadcrumbs} />
})

interface ISiteBreadcrumbProps {
  breadcrumbs: TBreadcrumbSegment[]
}

const SiteBreadcrumbs = observer(function SiteBreadcrumb({ breadcrumbs }: ISiteBreadcrumbProps) {
  const { t } = useTranslation()
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
