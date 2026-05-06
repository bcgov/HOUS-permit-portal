import { Badge, Box, BoxProps, Flex, Icon, Tabs, VStack } from "@chakra-ui/react"
import React from "react"

// THS COMPOENENT MUST BE USED INSIDE OF A TABS COMPONENT
// https://v2.chakra-ui.com/docs/components/tabs/usage

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
      as={tabsData ? Tabs.List : "div"}
      {...rest}
    >
      {tabsData ? (
        <VStack align="stretch" gap={1} w="full" pt={8}>
          {tabsData.map((tabData) => (
            <Tabs.Trigger key={tabData.label} value={String(tabData.tabIndex)}>
              <Flex align="center" justify="flex-start" w="full" gap={3}>
                <Flex align="center">
                  <Icon as={tabData.icon} mr={2} />
                  {tabData.label}
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
                  >
                    {tabData.badgeCount}
                  </Badge>
                )}
              </Flex>
            </Tabs.Trigger>
          ))}
        </VStack>
      ) : (
        children
      )}
    </Box>
  )
}
