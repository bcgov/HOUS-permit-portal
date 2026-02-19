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

  const [isComplete, setIsComplete] = React.useState(false)
  React.useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.key === navLink.key) {
        setIsComplete(!!e.detail.complete)
      }
    }
    window.addEventListener("szch:section", handler as any)
    return () => window.removeEventListener("szch:section", handler as any)
  }, [navLink.key])

  const effectiveHash = hash || "#compliance"
  const isActive = effectiveHash === `#${navLink.location}`
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
          {isComplete ? (
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
