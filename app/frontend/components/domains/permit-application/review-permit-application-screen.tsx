import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  Heading,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretDown, CaretRight, CaretUp, Info, NotePencil } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { CopyableValue } from "../../shared/base/copyable-value"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { PermitApplicationViewedAtTag } from "../../shared/permit-applications/permit-application-viewed-at-tag"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"
import { ChecklistSideBar } from "./checklist-sidebar"
import { ContactSummaryModal } from "./contact-summary-modal"
import { RevisionSideBar } from "./revision-sidebar"
import { SubmissionDownloadModal } from "./submission-download-modal"

interface IReferenceNumberForm {
  referenceNumber?: string
}

export const ReviewPermitApplicationScreen = observer(() => {
  const { currentPermitApplication, error } = usePermitApplication()
  const { t } = useTranslation()
  const formRef = useRef(null)
  const navigate = useNavigate()
  const { control, reset, handleSubmit } = useForm<IReferenceNumberForm>({
    defaultValues: {
      referenceNumber: currentPermitApplication?.referenceNumber || "",
    },
  })

  const {
    field: { value: referenceNumber, onChange: onReferenceNumberChange },
  } = useController<IReferenceNumberForm>({ control, name: "referenceNumber" })
  const [referenceNumberSnapshot, setReferenceNumberSnapshot] = useState<null | string>(null)

  const [completedBlocks, setCompletedBlocks] = useState({})

  const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()

  const [hideRevisionList, setHideRevisionList] = useState(false)

  useEffect(() => {
    reset({ referenceNumber: currentPermitApplication?.referenceNumber || "" })
  }, [currentPermitApplication?.referenceNumber])

  useEffect(() => {
    if (currentPermitApplication && !currentPermitApplication.isViewed) {
      currentPermitApplication.markAsViewed()
    }
  }, [currentPermitApplication])

  useEffect(() => {
    const container = document.getElementById("permitApplicationFieldsContainer")
    if (!container) return

    if (currentPermitApplication?.revisionMode) {
      container.classList.add("revision-mode")
    } else {
      container.classList.remove("revision-mode")
    }
  }, [currentPermitApplication?.revisionMode])

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication?.isFullyLoaded) return <LoadingScreen />

  const { permitTypeAndActivity, formJson, number, revisionMode, setRevisionMode } = currentPermitApplication

  const onSaveReferenceNumber = handleSubmit(async ({ referenceNumber: referenceNumberToSave }) => {
    if (referenceNumber === referenceNumberSnapshot) {
      return
    }

    try {
      const response = await currentPermitApplication.update({ referenceNumber: referenceNumberToSave })

      !response.ok && onReferenceNumberChange(referenceNumberSnapshot)
    } catch (e) {
      onReferenceNumberChange(referenceNumberSnapshot)
    }
  })
  const permitHeaderHeight = document.getElementById("permitHeader")?.offsetHeight

  return (
    <Box as="main" id="reviewing-permit-application">
      <Flex id="permitHeader" direction="column" position="sticky" top={0} zIndex={12}>
        <Flex w="full" px={6} py={3} bg="theme.blue" justify="space-between" color="greys.white">
          <HStack gap={4} flex={1}>
            <PermitApplicationViewedAtTag permitApplication={currentPermitApplication} />
            <Flex direction="column" w="full">
              <Heading fontSize="xl" as="h3">
                {currentPermitApplication.nickname}
              </Heading>
              <Text noOfLines={1}>{permitTypeAndActivity}</Text>
              <HStack>
                <CopyableValue
                  textTransform={"uppercase"}
                  value={number}
                  label={t("permitApplication.fields.number")}
                />
                <HStack mt={2} sx={{ svg: { fill: "theme.yellow" } }}>
                  <Text textTransform={"uppercase"}> {t("permitApplication.referenceNumber")}:</Text>
                  <EditableInputWithControls
                    size={"xs"}
                    value={referenceNumber}
                    onChange={onReferenceNumberChange}
                    onEdit={() => setReferenceNumberSnapshot(referenceNumber)}
                    onSubmit={() => onSaveReferenceNumber()}
                    editableInputProps={{
                      "aria-label": "Edit Template Description",
                      bg: "white",
                      color: "text.primary",
                      width: "79px",
                    }}
                    controlsProps={{
                      saveButtonProps: { variant: "primaryInverse", textContent: t("ui.onlySave") },
                      cancelButtonProps: { variant: "secondaryInverse" },
                    }}
                    aria-label={"Edit Template Description"}
                    onCancel={(previousValue) => onReferenceNumberChange(previousValue)}
                  />
                </HStack>
              </HStack>
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
        {revisionMode && (
          <Flex
            position="sticky"
            zIndex={11}
            w="full"
            p={4}
            bg="theme.yellow"
            justify="flex-start"
            align="center"
            gap={4}
            top={permitHeaderHeight}
          >
            <Flex width="var(--app-sidebar-width)" align="center" gap={2}>
              <NotePencil size={24} />
              <Heading fontSize="lg" mt={2}>
                {t("permitApplication.show.requestingRevisions")}
              </Heading>
              <Spacer />
              <Button
                fontSize="sm"
                h={8}
                p={1}
                variant="secondary"
                rightIcon={hideRevisionList ? <CaretDown /> : <CaretUp />}
                onClick={() => setHideRevisionList((cur) => !cur)}
              >
                {hideRevisionList ? t("permitApplication.show.showList") : t("permitApplication.show.hideList")}
              </Button>
              <Divider orientation="vertical" height="24px" mx={4} borderColor="greys.grey01" />
            </Flex>
          </Flex>
        )}
      </Flex>
      <Box id="sidebar-and-form-container" sx={{ "&:after": { content: `""`, display: "block", clear: "both" } }}>
        {revisionMode && !hideRevisionList ? (
          <RevisionSideBar permitApplication={currentPermitApplication} />
        ) : (
          <ChecklistSideBar permitApplication={currentPermitApplication} completedBlocks={completedBlocks} />
        )}
        {formJson && (
          <Flex flex={1} direction="column" p={8} position={"relative"} id="permitApplicationFieldsContainer">
            {!revisionMode && (
              <Container maxWidth="container.lg" p={8}>
                <Button variant="primary" leftIcon={<NotePencil />} onClick={() => setRevisionMode(true)}>
                  {t("permitApplication.show.requestRevisions")}
                </Button>
              </Container>
            )}
            <RequirementForm
              formRef={formRef}
              permitApplication={currentPermitApplication}
              onCompletedBlocksChange={setCompletedBlocks}
              showHelpButton
            />
          </Flex>
        )}
      </Box>
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
