import { Badge, Box, BoxProps, Flex, Icon, Tab, TabList, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { Link as RouterLink } from "react-router-dom"

// THIS COMPONENT MUST BE USED INSIDE OF A TABS COMPONENT
// https://v2.chakra-ui.com/docs/components/tabs/usage
// Tabs are RouterLinks for native Copy Link / Open in New Tab; left-click still uses Tabs onChange.

export interface ITabItem {
  label: string
  icon: React.ElementType
  to: string
  tabIndex: number
  badgeCount?: number
}

interface IProjectSidebarTabListProps extends BoxProps {
  top?: number | string
  tabsData?: ITabItem[]
}

const handleTabLinkClick = (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
}

export const ProjectSidebarTabList = ({ top = 0, tabsData, children, ...rest }: IProjectSidebarTabListProps) => {
  const navHeight = document.getElementById("mainNav")?.offsetHeight

  return (
    <Box
      minW="240px"
      bg="greys.grey04"
      borderRight="1px"
      borderColor="border.light"
      position="sticky"
      top={top}
      h="100vh"
      alignSelf="flex-start"
      pb={navHeight}
      as={tabsData ? TabList : "div"}
      {...rest}
    >
      {tabsData ? (
        <VStack align="stretch" spacing={1} w="full" pt={8}>
          {tabsData.map((tabData) => (
            <Tab key={tabData.label} as={RouterLink} to={tabData.to} onClick={handleTabLinkClick} w="full">
              <Flex align="center" justify="space-between" w="full" gap={3}>
                <Flex align="center" minW={0} flex={1} gap={2}>
                  <Icon as={tabData.icon} boxSize={5} flexShrink={0} />
                  <Text as="span" fontSize="md" lineHeight={6} whiteSpace="nowrap">
                    {tabData.label}
                  </Text>
                </Flex>
                {!!tabData.badgeCount && tabData.badgeCount > 0 && (
                  <Badge
                    bg="theme.blue"
                    color="white"
                    borderRadius="full"
                    minW={6}
                    h={6}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    {tabData.badgeCount}
                  </Badge>
                )}
              </Flex>
            </Tab>
          ))}
        </VStack>
      ) : (
        children
      )}
    </Box>
  )
}
