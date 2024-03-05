import { Box, Button, Flex, HStack, Heading, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { CaretRight, Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { CopyableValue } from "../../shared/base/copyable-value"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { PermitApplicationViewedAtTag } from "../../shared/permit-applications/permit-application-viewed-at-tag"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"
import { ChecklistSideBar } from "./checklist-sidebar"
import { ContactSummaryModal } from "./contact-summary-modal"
import { SubmissionDownloadModal } from "./submission-download-modal"

export const ReviewPermitApplicationScreen = observer(() => {
  const { currentPermitApplication, error } = usePermitApplication()
  const { t } = useTranslation()
  const formRef = useRef(null)
  const navigate = useNavigate()

  const [completedSections, setCompletedSections] = useState({})

  const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication) return <LoadingScreen />

  const { permitTypeAndActivity, formJson, number } = currentPermitApplication

  return (
    <Box as="main" overflow="hidden" h="full">
      <Flex
        id="permitHeader"
        position="sticky"
        top={0}
        zIndex={10}
        w="full"
        px={6}
        py={3}
        bg="theme.blue"
        justify="space-between"
        color="greys.white"
      >
        <HStack gap={4} flex={1}>
          <PermitApplicationViewedAtTag permitApplication={currentPermitApplication} />
          <Flex direction="column" w="full">
            <Heading fontSize="xl" as="h3">
              {currentPermitApplication.nickname}
            </Heading>

            <Text>{permitTypeAndActivity}</Text>

            <CopyableValue value={number} label={t("permitApplication.fields.number")} />
          </Flex>
        </HStack>
        <Stack direction={{ base: "column", lg: "row" }} align={{ base: "flex-end", lg: "center" }}>
          <Button variant="ghost" leftIcon={<Info size={20} />} color="white" onClick={onContactsOpen}>
            {t("permitApplication.show.contactsSummary")}
          </Button>
          <SubmissionDownloadModal permitApplication={currentPermitApplication} />
          <Button rightIcon={<CaretRight />} onClick={() => navigate("/")}>
            {t("ui.backHome")}
          </Button>
        </Stack>
      </Flex>
      <Flex w="full" h="calc(100% - 96px)" overflow="auto" id="permitApplicationFieldsContainer">
        <ChecklistSideBar permitApplication={currentPermitApplication} completedSections={completedSections} />
        {formJson && (
          <Flex flex={1} direction="column" p={24}>
            <RequirementForm
              formRef={formRef}
              permitApplication={currentPermitApplication}
              onCompletedSectionsChange={setCompletedSections}
            />
          </Flex>
        )}
      </Flex>
      {isContactsOpen && (
        <ContactSummaryModal
          isOpen={isContactsOpen}
          onOpen={onContactsOpen}
          onClose={onContactsClose}
          permitApplication={currentPermitApplication}
        />
      )}
    </Box>
  )
})
