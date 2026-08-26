import { Box, Divider, Flex, Heading, Hide, Tab, TabIndicator, TabList, Tabs, Text } from "@chakra-ui/react"
import { CheckCircle, CircleDashed } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { IPermitApplication } from "../../../models/permit-application"
import { stickyBelowNavBar } from "../../../styles/nav-bar-offset"

interface IChecklistSideBarProps {
  permitApplication: IPermitApplication
  completedBlocks: object
}

export const ChecklistSideBar = observer(({ permitApplication, completedBlocks }: IChecklistSideBarProps) => {
  const { formJson } = permitApplication
  const { selectedTabIndex, setSelectedTabIndex, getBlockClass } = permitApplication

  const navHeight = document.getElementById("mainNav")?.offsetHeight
  const permitHeaderHeight = document.getElementById("permitHeader")?.offsetHeight ?? 0

  // completedBlocks is keyed by live Form.io panel keys (hidden panels omitted once the form is ready).
  const visibilityReady = Object.keys(completedBlocks).length > 0

  // TODO: We should probably switch to use link anchors instead so we have the ability to bring someone directly and also focus on a specific block on the page.
  const handleTabsChange = (index: number, sectionId: string, blockId: string) => {
    setSelectedTabIndex(index)
    const className = getBlockClass(sectionId, blockId)
    const element = document.getElementsByClassName(className)[0] as HTMLElement
    if (element) {
      element.scrollIntoView({ behavior: "instant", block: "center" })
    }
  }

  let tabIndex = 0

  return (
    <Hide below="md">
      <Flex
        direction="column"
        boxShadow="md"
        borderRight="1px solid"
        borderRightColor="greys.grey02"
        width={"sidebar.width"}
        position="sticky"
        {...stickyBelowNavBar(`${permitHeaderHeight}px`)}
        bottom="0"
        height={`calc(100vh - ${permitHeaderHeight}px - var(--app-navbar-offset))`}
        float="left"
        id="permit-checklist-sidebar"
      >
        <Box overflowY="auto">
          <Tabs orientation="vertical" index={selectedTabIndex} w="full">
            <TabList w="full" border={0} py="4" pb={navHeight}>
              {formJson.components.map((section) => {
                const visibleBlocks = (section?.components || []).filter(
                  (block) => !visibilityReady || block.key in completedBlocks
                )
                if (visibleBlocks.length === 0) return null

                return (
                  <Box key={section.key}>
                    <Heading as="h3" fontSize="md" textTransform="uppercase" px={4} py={2}>
                      {section.title}
                    </Heading>
                    {visibleBlocks.map((block) => {
                      // Completion for Energy Step Code blocks is decided in getCompletedBlocksFromForm
                      // (digital tool method → stage checklist; file method → Form.io visible fields).
                      const showCompleted = completedBlocks[block.key] || false
                      const index = tabIndex++
                      return (
                        <Tab
                          key={block.key}
                          pl={6}
                          gap={2}
                          w="full"
                          _selected={{ color: "theme.blue", bg: "theme.blueLight", fontWeight: "bold" }}
                          justifyContent="flex-start"
                          textAlign="left"
                          onClick={() => handleTabsChange(index, section.id, block.id)}
                        >
                          <Flex align="center">
                            <Box w={5} mr={2}>
                              {showCompleted ? (
                                <CheckCircle color="var(--chakra-colors-semantic-success)" size={18} />
                              ) : (
                                <CircleDashed color="var(--chakra-colors-greys-grey01)" size={18} />
                              )}{" "}
                            </Box>
                            <Text>{block.title}</Text>
                          </Flex>
                        </Tab>
                      )
                    })}
                    <Divider color="greys.grey01" />
                  </Box>
                )
              })}
            </TabList>

            <TabIndicator bg="theme.blue" border="2px solid" />
          </Tabs>
        </Box>
      </Flex>
    </Hide>
  )
})
