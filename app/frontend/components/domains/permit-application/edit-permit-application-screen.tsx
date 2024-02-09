import { Box, Button, Divider, Flex, HStack, Heading, Tab, TabIndicator, TabList, Tabs, Text } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { IPermitApplication } from "../../../models/permit-application"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"

interface IEditPermitApplicationScreenProps {}

export const EditPermitApplicationScreen = observer(({}: IEditPermitApplicationScreenProps) => {
  const { currentPermitApplication, error } = usePermitApplication()
  const { t } = useTranslation()
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication) return <LoadingScreen />

  const { permitTypeAndActivity, fullAddress, pid, pin, formJson, nickname } = currentPermitApplication

  return (
    <>
      <Flex
        w="full"
        p={6}
        bg="theme.blue"
        justify="space-between"
        color="greys.white"
        position="sticky"
        top={0}
        zIndex={10}
        maxH="96px"
      >
        <HStack gap={4}>
          <PermitApplicationStatusTag
            bg="transparent"
            color="greys.white"
            permitApplication={currentPermitApplication}
          />
          <Flex direction="column">
            <Heading fontSize="xl" mb={0}>
              {nickname}
            </Heading>
            <Text>{permitTypeAndActivity}</Text>
          </Flex>
        </HStack>
        <HStack gap={4}>
          <Button variant="primary">{t("permitApplication.edit.saveDraft")}</Button>
          <Button rightIcon={<CaretRight />}>{t("permitApplication.edit.submit")}</Button>
        </HStack>
      </Flex>
      <Flex as="main" direction="column" w="full" bg="greys.white" key={"permit-application-show"}>
        <Box w="full">
          <ChecklistSideBar permitApplication={currentPermitApplication} currentSectionId={currentSectionId} />
          {formJson && (
            <Flex direction="column" pl={24} pt={24} pr={288}>
              {/* <FormControl>
              <FormLabel>{t("permitApplication.edit.permit")}</FormLabel>
              <Input type="text" disabled={true} value={permitTypeAndActivity} />
            </FormControl>
            <FormControl>
              <FormLabel>{t("permitApplication.edit.fullAddress")}</FormLabel>
              <Input type="text" disabled={true} value={fullAddress || ""} />
            </FormControl>
            <FormControl>
              <FormLabel>{t("permitApplication.edit.pidPin")}</FormLabel>
              <Input type="text" disabled={true} value={`${pid || pin || ""}`} />
            </FormControl> */}
              <RequirementForm
                permitApplication={currentPermitApplication}
                emitCurrentSectionId={setCurrentSectionId}
              />
            </Flex>
          )}
        </Box>
      </Flex>
    </>
  )
})

interface IChecklistSideBarProps {
  permitApplication: IPermitApplication
  currentSectionId: string | null
}

export const ChecklistSideBar = observer(({ permitApplication, currentSectionId }: IChecklistSideBarProps) => {
  const { formJson, flattenedBlocks } = permitApplication
  const { selectedTabIndex, setSelectedTabIndex, indexOfBlockId, blockClass } = permitApplication

  const handleTabsChange = (index: number, sectionId: string, blockId: string) => {
    setSelectedTabIndex(index)
    const className = blockClass(sectionId, blockId)
    const element = document.getElementsByClassName(className)[0] as HTMLElement
    if (element) {
      element.scrollIntoView({ behavior: "instant", block: "center" })
    }
  }

  return (
    <Flex direction="column" boxShadow="md" w={378}>
      <Box position="fixed" left={0} bottom={0} top={0} overflowY="auto" border="1px solid" borderColor="greys.grey02">
        <Tabs orientation="vertical" index={selectedTabIndex} w="full" pt={160}>
          <TabList w="full" border={0}>
            {formJson.components.map((section) => {
              return (
                <Box key={section.key}>
                  <Heading
                    fontSize="md"
                    textTransform="uppercase"
                    px={4}
                    py={2}
                    {...(currentSectionId === section.id
                      ? {
                          color: "theme.blue",
                          bg: "theme.blueLight",
                        }
                      : {})}
                  >
                    {section.title}
                  </Heading>
                  {section?.components?.map((block) => {
                    return (
                      <Tab
                        key={block.key}
                        pl={6}
                        w="full"
                        _selected={{ color: "theme.blue", bg: "theme.blueLight" }}
                        justifyContent="flex-start"
                        textAlign="left"
                        onClick={() => handleTabsChange(indexOfBlockId(block.id), section.id, block.id)}
                      >
                        {block.label}
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
