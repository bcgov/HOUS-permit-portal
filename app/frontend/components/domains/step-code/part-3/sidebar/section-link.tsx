import { Flex, Text } from "@chakra-ui/react"
import { CheckCircle, CircleDashed } from "@phosphor-icons/react"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { useLocation, useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { IPart3NavLink } from "../../../../../types/types"
import { RouterLink } from "../../../../shared/navigation/router-link"

interface IProps {
  navLink: IPart3NavLink
}

export const SectionLink = function StepCodeSidebarSectionLink({ navLink, ...rest }) {
  const { section } = useParams()
  const { stepCode } = usePart3StepCode()
  const { checklist } = stepCode
  const { pathname } = useLocation()
  let baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)

  const isActive = section == navLink.location
  const activeProps = isActive
    ? {
        color: "theme.blue",
        bg: "theme.blueLight",
        fontWeight: "bold",
        borderColor: "theme.blueAlt",
      }
    : {}

  return (
    <RouterLink to={`${baseUrl}/${navLink.location}`} textDecoration="none" _hover={{ textDecoration: "none" }}>
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
        {...rest}
      >
        <Flex flex="none">
          {checklist.isComplete(navLink.key) ? (
            <CheckCircle color="var(--chakra-colors-semantic-success)" size={18} />
          ) : (
            <CircleDashed color="var(--chakra-colors-greys-grey01)" size={18} />
          )}
        </Flex>
        <Text>{t(`stepCode.part3.sidebar.${navLink.key}`)}</Text>
      </Flex>
    </RouterLink>
  )
}
