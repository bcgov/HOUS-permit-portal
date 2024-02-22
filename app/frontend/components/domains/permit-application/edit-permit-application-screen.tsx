import { Box, Button, Flex, HStack, Heading, Text } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { useInterval } from "../../../hooks/use-interval"
import { handleScrollToBottom } from "../../../utils/utility-funcitons"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"
import { ChecklistSideBar } from "./checklist-sidebar"

interface IEditPermitApplicationScreenProps {}

export const EditPermitApplicationScreen = observer(({}: IEditPermitApplicationScreenProps) => {
  const { currentPermitApplication, error } = usePermitApplication()
  const { t } = useTranslation()

  // Tracks the submission data from the onChange event for saving as draft
  const [mirroredSubmissionState, setMirroredSubmissionState] = useState(null)
  const [completedSections, setCompletedSections] = useState({})

  const onFormChange = (submission: any) => {
    delete submission.changed
    delete submission.isValid
    setMirroredSubmissionState(submission)
  }

  const handleSave = () => {
    currentPermitApplication.update({ submissionData: mirroredSubmissionState })
  }

  useInterval(handleSave, 60000) // save progress every minute

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication) return <LoadingScreen />

  const { permitTypeAndActivity, formJson, nickname } = currentPermitApplication
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
            <Heading as="h3" fontSize="xl" mb={0}>
              {nickname}
            </Heading>
            <Text>{permitTypeAndActivity}</Text>
          </Flex>
        </HStack>
        <HStack gap={4}>
          <Button variant="primary" onClick={handleSave}>
            {t("permitApplication.edit.saveDraft")}
          </Button>
          <Button rightIcon={<CaretRight />} onClick={handleScrollToBottom}>
            {t("permitApplication.edit.submit")}
          </Button>
        </HStack>
      </Flex>
      <Flex as="main" direction="column" w="full" bg="greys.white" key={"permit-application-show"}>
        <Box w="full">
          <ChecklistSideBar permitApplication={currentPermitApplication} completedSections={completedSections} />
          {formJson && (
            <Flex direction="column" pl={24} py={24} pr={288}>
              <RequirementForm
                permitApplication={currentPermitApplication}
                onFormChange={onFormChange}
                onCompletedSectionsChange={setCompletedSections}
              />
            </Flex>
          )}
        </Box>
      </Flex>
    </>
  )
})
