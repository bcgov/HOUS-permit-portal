import { Box, BoxProps, Flex, Icon, Tab, TabList, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { UnreadBadge } from "../../../shared/base/unread-badge"
import { handleSidebarTabLinkClick } from "../../permit-project/project-sidebar-tab-list"

export interface IReviewerWorkspaceTabItem {
  label: string
  icon: React.ElementType
  to: string
  tabIndex: number
  badgeCount?: number | null
}

interface IReviewerWorkspaceSidebarProps extends BoxProps {
  tabsData: IReviewerWorkspaceTabItem[]
  title: string
}

// This component must be rendered inside a Chakra Tabs component.
export const ReviewerWorkspaceSidebar = ({ tabsData, title, ...rest }: IReviewerWorkspaceSidebarProps) => {
  const location = useLocation()

  return (
    <Box
      as={TabList}
      w="200px"
      minW="200px"
      bg="greys.grey10"
      borderRight="1px solid"
      borderColor="border.light"
      flexDirection="column"
      alignItems="stretch"
      py={4}
      overflowY="auto"
      {...rest}
    >
      <Text fontSize="xs" fontWeight="bold" color="text.secondary" mb={4} px={4} textTransform="uppercase">
        {title}
      </Text>
      <VStack align="stretch" spacing={1} w="full">
        {tabsData.map((tabData) => (
          <Tab
            key={tabData.to}
            as={RouterLink}
            to={tabData.to}
            onClick={(e) => handleSidebarTabLinkClick(e, tabData.to, location.pathname)}
            w="full"
            h={9}
            borderRadius={0}
            justifyContent="flex-start"
            px={4}
            py={0}
            fontWeight="normal"
            color="text.primary"
            _visited={{ color: "text.primary" }}
            _active={{ color: "text.primary" }}
            _hover={{ color: "text.primary", textDecoration: "none" }}
            _selected={{
              bg: "background.blueLight",
              fontWeight: "bold",
              color: "text.primary",
              _visited: { color: "text.primary" },
            }}
          >
            <Flex align="center" justify="space-between" w="full">
              <Flex align="center" gap={2} minW={0}>
                <Icon as={tabData.icon} boxSize={4} flexShrink={0} />
                <Text as="span" noOfLines={1}>
                  {tabData.label}
                </Text>
              </Flex>
              <UnreadBadge count={tabData.badgeCount} />
            </Flex>
          </Tab>
        ))}
      </VStack>
    </Box>
  )
}
