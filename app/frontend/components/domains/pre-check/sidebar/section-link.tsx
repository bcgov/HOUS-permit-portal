import { Flex, Text } from "@chakra-ui/react"
import { CheckCircle, CircleDashed } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useLocation, useParams } from "react-router-dom"
import { RouterLink } from "../../../shared/navigation/router-link"
import { INavLink } from "./nav-sections"

interface ISectionLinkProps {
  navLink: INavLink
  isComplete?: boolean
  isDisabled?: boolean
}

export const SectionLink = observer(function SectionLink({
  navLink,
  isComplete,
  isDisabled,
  ...rest
}: ISectionLinkProps) {
  const { section } = useParams()
  const { pathname } = useLocation()
  let baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)

  const isActive = section === navLink.location
  const activeProps = isActive
    ? {
        color: "theme.blue",
        bg: "theme.blueLight",
        fontWeight: "bold",
        borderColor: "theme.blueAlt",
      }
    : {}

  const disabledProps = isDisabled
    ? {
        opacity: 0.5,
        cursor: "not-allowed",
        pointerEvents: "none" as const,
      }
    : {}

  const content = (
    <Flex
      align="center"
      pl={6}
      py={2}
      gap={2}
      borderLeftWidth={6}
      borderColor="transparent"
      textAlign="left"
      color="text.primary"
      {...activeProps}
      {...disabledProps}
      {...rest}
    >
      <Flex flex="none">
        {isComplete ? (
          <CheckCircle color="var(--chakra-colors-semantic-success)" size={18} />
        ) : (
          <CircleDashed color="var(--chakra-colors-greys-grey01)" size={18} />
        )}
      </Flex>
      <Text>{t(`preCheck.sidebar.${navLink.key}` as const as any)}</Text>
    </Flex>
  )

  // If disabled, render without RouterLink to prevent navigation
  if (isDisabled) {
    return content
  }

  return (
    <RouterLink to={`${baseUrl}/${navLink.location}`} textDecoration="none" _hover={{ textDecoration: "none" }}>
      {content}
    </RouterLink>
  )
})
