import { Flex, Text } from "@chakra-ui/react"
import { CircleDashed } from "@phosphor-icons/react"
import React from "react"
import { useParams } from "react-router-dom"
import { RouterLink } from "../../../../shared/navigation/router-link"

export const SectionLink = function StepCodeSidebarSectionLink({ navLink, ...rest }) {
  const { section } = useParams()

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
    <RouterLink to={`/part-3-step-code/${navLink.location}`} textDecoration="none" _hover={{ textDecoration: "none" }}>
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
          {/* TODO: complete/incomplete status */}
          {/* {completedSections.start ? ( */}
          {/* <CheckCircle color="var(--chakra-colors-semantic-success)" size={18} /> */}
          {/* ) : ( */}
          <CircleDashed color="var(--chakra-colors-greys-grey01)" size={18} />
          {/* )}{" "} */}
        </Flex>
        <Text>{navLink.title}</Text>
      </Flex>
    </RouterLink>
  )
}
