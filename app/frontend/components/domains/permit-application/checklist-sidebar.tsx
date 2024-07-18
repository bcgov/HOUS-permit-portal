import { Box, Divider, Flex, Heading, Hide, Tab, TabIndicator, TabList, Tabs, Text } from "@chakra-ui/react"
import { CheckCircle, CircleDashed } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { IPermitApplication } from "../../../models/permit-application"

interface IChecklistSideBarProps {
  permitApplication: IPermitApplication
  completedBlocks: object
}

export const ChecklistSideBar = observer(({ permitApplication, completedBlocks }: IChecklistSideBarProps) => {
  const { formJson } = permitApplication
  const { selectedTabIndex, setSelectedTabIndex, indexOfBlockId, getBlockClass } = permitApplication

  const navHeight = document.getElementById("mainNav")?.offsetHeight
  const permitHeaderHeight = document.getElementById("permitHeader")?.offsetHeight

  // TODO: We should probably switch to use link anchors instead so we have the ability to bring someone directly and also focus on a specific block on the page.
  const handleTabsChange = (index: number, sectionId: string, blockId: string) => {
    setSelectedTabIndex(index)
    const className = getBlockClass(sectionId, blockId)
    const element = document.getElementsByClassName(className)[0] as HTMLElement
    if (element) {
      element.scrollIntoView({ behavior: "instant", block: "center" })
    }
  }

  return (
    <Hide below="md">
      <Flex
        direction="column"
        boxShadow="md"
        borderRight="1px solid"
        borderRightColor="greys.grey02"
        width={"sidebar.width"}
        position="sticky"
        top={permitHeaderHeight}
        bottom="0"
        height={`calc(100vh - ${permitHeaderHeight}px)`}
        float="left"
        id="permit-checklist-sidebar"
      >
        <Box overflowY="auto">
          <Tabs orientation="vertical" index={selectedTabIndex} w="full">
            <TabList w="full" border={0} py="4" pb={navHeight}>
              {formJson.components.map((section) => {
                return (
                  <Box key={section.key}>
                    <Heading as="h3" fontSize="md" textTransform="uppercase" px={4} py={2}>
                      {section.title}
                    </Heading>
                    {section?.components?.map((block) => {
                      return (
                        <Tab
                          key={block.key}
                          pl={6}
                          gap={2}
                          w="full"
                          _selected={{ color: "theme.blue", bg: "theme.blueLight", fontWeight: "bold" }}
                          justifyContent="flex-start"
                          textAlign="left"
                          onClick={() => handleTabsChange(indexOfBlockId(block.id), section.id, block.id)}
                        >
                          <Flex align="center">
                            <Box w={5} mr={2}>
                              {completedBlocks[block.key] ? (
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
