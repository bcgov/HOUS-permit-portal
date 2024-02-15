import { Box, Divider, Flex, Heading, Tab, TabIndicator, TabList, Tabs } from "@chakra-ui/react"
import { CheckCircle, CircleDashed } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { IPermitApplication } from "../../../models/permit-application"

interface IChecklistSideBarProps {
  permitApplication: IPermitApplication
}

export const ChecklistSideBar = observer(({ permitApplication }: IChecklistSideBarProps) => {
  const { formJson } = permitApplication
  const { selectedTabIndex, setSelectedTabIndex, indexOfBlockId, getBlockClass, getIsBlockPopulated } =
    permitApplication

  const handleTabsChange = (index: number, sectionId: string, blockId: string) => {
    setSelectedTabIndex(index)
    const className = getBlockClass(sectionId, blockId)
    const element = document.getElementsByClassName(className)[0] as HTMLElement
    if (element) {
      element.scrollIntoView({ behavior: "instant", block: "center" })
    }
  }

  return (
    <Flex direction="column" boxShadow="md" w={378}>
      <Box
        position="fixed"
        left={0}
        bottom={0}
        top={0}
        overflowY="auto"
        border="1px solid"
        borderColor="greys.grey02"
        maxW={378}
      >
        <Tabs orientation="vertical" index={selectedTabIndex} w="full" pt={160}>
          <TabList w="full" border={0}>
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
                        _selected={{ color: "theme.blue", bg: "theme.blueLight" }}
                        justifyContent="flex-start"
                        textAlign="left"
                        onClick={() => handleTabsChange(indexOfBlockId(block.id), section.id, block.id)}
                      >
                        {getIsBlockPopulated(section.id, block.id) ? (
                          <CheckCircle color="#2E8540" size={18} />
                        ) : (
                          <CircleDashed color="#A19F9D" size={18} />
                        )}{" "}
                        {block.title}
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
