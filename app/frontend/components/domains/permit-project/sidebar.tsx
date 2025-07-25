import { Box, BoxProps, Icon, Tab, TabList, VStack } from "@chakra-ui/react"
import React from "react"

export interface ITabItem {
  label: string
  icon: React.ElementType
  to: string
}

interface IProjectSidebarProps extends BoxProps {
  top?: number | string
  tabsData: ITabItem[]
}

const tabProps = {
  justifyContent: "flex-start",
  _selected: {
    fontWeight: "bold",
    bg: "background.blueLight",
  },
}

export const ProjectSidebar = ({ top = 0, tabsData, ...rest }: IProjectSidebarProps) => {
  const navHeight = document.getElementById("mainNav")?.offsetHeight

  return (
    <Box
      w="280px"
      bg="greys.grey03"
      borderRight="1px"
      borderColor="border.light"
      position="sticky"
      top={top}
      h="100vh"
      alignSelf="flex-start"
      pb={navHeight}
      as={TabList}
      {...rest}
    >
      <VStack align="stretch" spacing={1} w="full" pt={8}>
        {tabsData.map((tabData) => (
          <Tab key={tabData.label} {...tabProps}>
            <Icon as={tabData.icon} mr={2} />
            {tabData.label}
          </Tab>
        ))}
      </VStack>
    </Box>
  )
}
