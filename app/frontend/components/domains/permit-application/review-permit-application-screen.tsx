import { Box, Button, Flex, HStack, Heading, Text, useDisclosure } from "@chakra-ui/react"
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

export const ReviewPermitApplicationScreen = observer(() => {
  const { currentPermitApplication, error } = usePermitApplication()
  const { t } = useTranslation()
  const formRef = useRef(null)
  const navigate = useNavigate()

  const [completedSections, setCompletedSections] = useState({})

  const handleDownloadApplication = () => {}

  const { isOpen, onOpen, onClose } = useDisclosure()

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
        <HStack>
          <Button variant="ghost" leftIcon={<Info size={20} />} color="white" onClick={onOpen}>
            {t("permitApplication.show.contactsSummary")}
          </Button>
          <Button variant="primary" onClick={handleDownloadApplication}>
            {t("permitApplication.show.downloadApplication")}
          </Button>
          <Button rightIcon={<CaretRight />} onClick={() => navigate("/")}>
            {t("ui.backHome")}
          </Button>
        </HStack>
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
      {isOpen && (
        <ContactSummaryModal
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          permitApplication={currentPermitApplication}
        />
      )}
    </Box>
  )
})
