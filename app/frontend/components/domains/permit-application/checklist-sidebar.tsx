import { Box, Divider, Flex, Heading, Tab, TabIndicator, TabList, Tabs, Text } from "@chakra-ui/react"
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
    <Flex
      direction="column"
      boxShadow="md"
      flexBasis={378}
      minWidth={378}
      position="sticky"
      top={permitHeaderHeight}
      bottom="0"
      height={"calc(100vh - " + permitHeaderHeight + "px)"}
    >
      <Box overflowY="auto" border="1px solid" borderColor="greys.grey02">
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
                              <CheckCircle color="#2E8540" size={18} />
                            ) : (
                              <CircleDashed color="#A19F9D" size={18} />
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
  )
})
