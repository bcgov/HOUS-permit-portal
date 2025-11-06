import { Flex, Text } from "@chakra-ui/react"
import { CheckCircle, CircleDashed } from "@phosphor-icons/react"
import React from "react"
import { useLocation } from "react-router-dom"
import { INavLink, navLinks } from "./nav-sections"

interface IProps {
  navLink: INavLink
}

export const SectionLink = function SingleZoneSidebarSectionLink({ navLink, ...rest }) {
  const { pathname, hash } = useLocation()
  // Simple checklist derived from nav-sections: all items are relevant; mark complete if hash matches
  const allKeys = React.useMemo(() => {
    const keys = new Set<string>()
    const addKeys = (links: INavLink[]) => {
      links.forEach((l) => {
        keys.add(l.key)
        if (l.subLinks && l.subLinks.length) addKeys(l.subLinks)
      })
    }
    addKeys(navLinks)
    return keys
  }, [])

  const checklist = React.useMemo(
    () => ({
      isRelevant: (key: string) => allKeys.has(key),
      isComplete: (key: string) => hash === `#${navLink.location}` && key === navLink.key,
    }),
    [allKeys, hash, navLink.location, navLink.key]
  )
  const isActive = hash === `#${navLink.location}`
  const activeProps = isActive
    ? {
        color: "theme.blue",
        bg: "theme.blueLight",
        fontWeight: "bold",
        borderColor: "theme.blueAlt",
      }
    : {}

  return (
    <a href={`#${navLink.location}`} style={{ textDecoration: "none" }}>
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
        <Text>{navLink.label}</Text>
      </Flex>
    </a>
  )
}
