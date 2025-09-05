import { Box, BoxProps, Icon, Tab, TabList, VStack } from "@chakra-ui/react"
import React from "react"

// THS COMPOENENT MUST BE USED INSIDE OF A TABS COMPONENT
// https://v2.chakra-ui.com/docs/components/tabs/usage

export interface ITabItem {
  label: string
  icon: React.ElementType
  to: string
  tabIndex: number
}

interface IProjectSidebarTabListProps extends BoxProps {
  top?: number | string
  tabsData?: ITabItem[]
}

const tabProps = {
  justifyContent: "flex-start",
  _selected: {
    fontWeight: "bold",
    bg: "background.blueLight",
  },
}

export const ProjectSidebarTabList = ({ top = 0, tabsData, children, ...rest }: IProjectSidebarTabListProps) => {
  const navHeight = document.getElementById("mainNav")?.offsetHeight

  return (
    <Box
      minW="240px"
      bg="greys.grey03"
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
            <Tab key={tabData.label} {...tabProps}>
              <Icon as={tabData.icon} mr={2} />
              {tabData.label}
            </Tab>
          ))}
        </VStack>
      ) : (
        children
      )}
    </Box>
  )
}
