import { Flex, Text } from "@chakra-ui/react"
import { CheckCircle, CircleDashed } from "@phosphor-icons/react"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { useLocation, useParams } from "react-router-dom"
import { usePart9StepCode } from "../../../../../hooks/resources/use-part-9-step-code"
import { IPart9NavLink } from "../../../../../types/types"
import { RouterLink } from "../../../../shared/navigation/router-link"

interface IProps {
  navLink: IPart9NavLink
  isDisabled?: boolean
}

export const SectionLink = function Part9StepCodeSidebarSectionLink({ navLink, isDisabled, ...rest }: IProps) {
  const { section } = useParams()
  const { checklist } = usePart9StepCode()
  const { pathname } = useLocation()
  const baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)

  const isActive = section == navLink.location
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
        {checklist?.isComplete(navLink.key) ? (
          <CheckCircle color="var(--chakra-colors-semantic-success)" size={18} />
        ) : (
          <CircleDashed color="var(--chakra-colors-greys-grey01)" size={18} />
        )}
      </Flex>
      <Text>{t(`stepCode.part9.sidebar.${navLink.key}`)}</Text>
    </Flex>
  )

  if (isDisabled) return content

  return (
    <RouterLink to={`${baseUrl}/${navLink.location}`} textDecoration="none" _hover={{ textDecoration: "none" }}>
      {content}
    </RouterLink>
  )
}
