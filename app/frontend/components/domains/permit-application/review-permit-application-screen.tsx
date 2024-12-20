import { Box, Button, Divider, Flex, HStack, Heading, Spacer, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { CaretDown, CaretRight, CaretUp, Info, NotePencil } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { ECollaborationType } from "../../../types/enums"
import { CopyableValue } from "../../shared/base/copyable-value"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { BrowserSearchPrompt } from "../../shared/permit-applications/browser-search-prompt"
import { PermitApplicationViewedAtTag } from "../../shared/permit-applications/permit-application-viewed-at-tag"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"
import SandboxHeader from "../../shared/sandbox/sandbox-header"
import { ChecklistSideBar } from "./checklist-sidebar"
import { BlockCollaboratorAssignmentManagement } from "./collaborator-management/block-collaborator-assignment-management"
import { CollaboratorsSidebar } from "./collaborator-management/collaborators-sidebar"
import { useCollaborationAssignmentNodes } from "./collaborator-management/hooks/use-collaboration-assignment-nodes"
import { ContactSummaryModal } from "./contact-summary-modal"
import { RevisionSideBar } from "./revision-sidebar"
import { SubmissionDownloadModal } from "./submission-download-modal"

interface IReferenceNumberForm {
  referenceNumber?: string
}

export const ReviewPermitApplicationScreen = observer(() => {
  const { currentPermitApplication, error } = usePermitApplication({ review: true })
  const { t } = useTranslation()
  const formRef = useRef(null)
  const { requirementBlockAssignmentNodes, updateRequirementBlockAssignmentNode } = useCollaborationAssignmentNodes({
    formRef,
  })
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

  const sendRevisionContainerRef = useRef<HTMLDivElement | null>(null)

  const permitHeaderRef = useRef()

  useEffect(() => {
    reset({ referenceNumber: currentPermitApplication?.referenceNumber || "" })
  }, [currentPermitApplication?.referenceNumber])

  useEffect(() => {
    if (currentPermitApplication) {
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

  const { permitTypeAndActivity, formattedFormJson, number, revisionMode, setRevisionMode } = currentPermitApplication

  const onSaveReferenceNumber = handleSubmit(async ({ referenceNumber: referenceNumberToSave }) => {
    if (referenceNumber === referenceNumberSnapshot) {
      return
    }

    try {
      const response = await currentPermitApplication.update({
        referenceNumber: referenceNumberToSave,
        review: true,
      })

      !response.ok && onReferenceNumberChange(referenceNumberSnapshot)
    } catch (e) {
      onReferenceNumberChange(referenceNumberSnapshot)
    }
  })

  // @ts-ignore
  const permitHeaderHeight = permitHeaderRef?.current?.offsetHeight ?? 0

  return (
    <Box as="main" id="reviewing-permit-application">
      <Flex id="permitHeader" direction="column" position="sticky" top={0} zIndex={12} ref={permitHeaderRef}>
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
                    editablePreviewProps={{
                      mb: 4,
                    }}
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
            <BrowserSearchPrompt />
            <Button variant="ghost" leftIcon={<Info size={20} />} color="white" onClick={onContactsOpen}>
              {t("permitApplication.show.contactsSummary")}
            </Button>
            <SubmissionDownloadModal permitApplication={currentPermitApplication} review />
            <Button
              rightIcon={<CaretRight />}
              onClick={() => navigate(`/jurisdictions/${currentPermitApplication.jurisdiction.slug}/submission-inbox`)}
            >
              {t("ui.backToInbox")}
            </Button>
          </Stack>
        </Flex>
        {revisionMode && (
          <Flex
            position="sticky"
            zIndex={11}
            w="full"
            px={4}
            py={2}
            bg="theme.yellow"
            justify="flex-start"
            align="center"
            gap={4}
            top={permitHeaderHeight}
          >
            <Flex width={"sidebar.width"} align="center" gap={2}>
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
            <Flex align="center" gap={2} flex={1} justify="flex-end" ref={sendRevisionContainerRef}></Flex>
          </Flex>
        )}
        {currentPermitApplication.sandbox && (
          <SandboxHeader borderTopRadius={0} override sandbox={currentPermitApplication.sandbox} position="sticky" />
        )}
      </Flex>
      <Box id="sidebar-and-form-container" sx={{ "&:after": { content: `""`, display: "block", clear: "both" } }}>
        {revisionMode && !hideRevisionList ? (
          <RevisionSideBar
            permitApplication={currentPermitApplication}
            onCancel={() => setRevisionMode(false)}
            sendRevisionContainerRef={sendRevisionContainerRef}
          />
        ) : (
          <ChecklistSideBar permitApplication={currentPermitApplication} completedBlocks={completedBlocks} />
        )}
        {formattedFormJson && (
          <Flex flex={1} direction="column" pt={8} position={"relative"} id="permitApplicationFieldsContainer" gap={8}>
            <RequirementForm
              formRef={formRef}
              permitApplication={currentPermitApplication}
              onCompletedBlocksChange={setCompletedBlocks}
              showHelpButton
              renderTopButtons={() => {
                return (
                  !revisionMode && (
                    <HStack spacing={6}>
                      <Button variant="callout" leftIcon={<NotePencil />} onClick={() => setRevisionMode(true)}>
                        {currentPermitApplication.isRevisionsRequested
                          ? t("permitApplication.show.viewRevisionRequests")
                          : t("permitApplication.show.requestRevisions")}{" "}
                        {currentPermitApplication?.latestRevisionRequests?.length > 0 &&
                          `(${currentPermitApplication.latestRevisionRequests.length})`}
                      </Button>
                      <CollaboratorsSidebar
                        permitApplication={currentPermitApplication}
                        collaborationType={ECollaborationType.review}
                        triggerButtonProps={{
                          variant: "secondary",
                        }}
                      />
                    </HStack>
                  )
                )
              }}
              updateCollaborationAssignmentNodes={updateRequirementBlockAssignmentNode}
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
      {requirementBlockAssignmentNodes.map((requirementBlockAssignmentNode) => {
        return (
          <BlockCollaboratorAssignmentManagement
            key={requirementBlockAssignmentNode.requirementBlockId}
            requirementBlockAssignmentNode={requirementBlockAssignmentNode}
            permitApplication={currentPermitApplication}
            collaborationType={ECollaborationType.review}
          />
        )
      })}
    </Box>
  )
})
