import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Menu,
  Portal,
  Separator,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { ArrowsClockwise, CaretDown, CaretRight, CaretUp, Info, NotePencil, Swap } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { ECollaborationType, EPermitApplicationStatus } from "../../../types/enums"
import { CopyableValue } from "../../shared/base/copyable-value"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { NotFoundScreen } from "../../shared/base/not-found-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { BrowserSearchPrompt } from "../../shared/permit-applications/browser-search-prompt"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"
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

  const { open: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()

  const [hideRevisionList, setHideRevisionList] = useState(false)
  const [isRetriggeringWebhook, setIsRetriggeringWebhook] = useState(false)
  const [isStartingReview, setIsStartingReview] = useState(false)

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

  const { tagsOrNickname, formattedFormJson, number, revisionMode, setRevisionMode } = currentPermitApplication

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

  const handleRetriggerWebhook = async () => {
    if (!currentPermitApplication) return

    setIsRetriggeringWebhook(true)
    try {
      const response = await currentPermitApplication.retriggerSubmissionWebhook()
      if (response.ok) {
        console.log("Submission webhook retriggered successfully")
      } else {
        console.error("Error retriggering submission webhook")
      }
    } catch (error) {
      console.error("Error retriggering submission webhook:", error)
    } finally {
      setIsRetriggeringWebhook(false)
    }
  }
  // @ts-ignore
  const permitHeaderHeight = permitHeaderRef?.current?.offsetHeight ?? 0

  if (currentPermitApplication.status === EPermitApplicationStatus.newDraft) return <NotFoundScreen />

  const isReadOnly = currentPermitApplication.isReviewReadOnly
  const canStartReview =
    currentPermitApplication.status === EPermitApplicationStatus.newlySubmitted ||
    currentPermitApplication.status === EPermitApplicationStatus.resubmitted

  const handleStartReview = async () => {
    setIsStartingReview(true)
    try {
      await currentPermitApplication.transitionStatus("in_review")
    } finally {
      setIsStartingReview(false)
    }
  }

  return (
    <Box as="main" id="reviewing-permit-application">
      <Flex id="permitHeader" direction="column" position="sticky" top={0} zIndex={12} ref={permitHeaderRef}>
        <Flex w="full" px={6} py={3} bg="theme.blue" justify="space-between" color="greys.white">
          <HStack gap={4} flex={1}>
            <PermitApplicationStatusTag status={currentPermitApplication.status} />
            <Flex direction="column" w="full">
              <Heading fontSize="xl" as="h3">
                {currentPermitApplication.nickname}
              </Heading>
              <Text lineClamp={1}>{tagsOrNickname}</Text>
              <HStack>
                <CopyableValue
                  textTransform={"uppercase"}
                  value={number}
                  label={t("permitApplication.fields.number")}
                />
                <HStack
                  mt={2}
                  css={{
                    "& svg": { fill: "theme.yellow" },
                  }}
                >
                  <Text textTransform={"uppercase"} whiteSpace="nowrap" flexShrink={0}>
                    {" "}
                    {t("permitApplication.referenceNumber")}:
                  </Text>
                  <EditableInputWithControls
                    size={"xs"}
                    value={referenceNumber}
                    onChange={onReferenceNumberChange}
                    onEdit={() => setReferenceNumberSnapshot(referenceNumber)}
                    onSubmit={() => onSaveReferenceNumber()}
                    editablePreviewProps={{
                      mb: 0,
                    }}
                    editableInputProps={{
                      "aria-label": "Edit Reference Number",
                      bg: "white",
                      color: "text.primary",
                      width: "calc(10ch + 1.5em)",
                    }}
                    controlsProps={{
                      saveButtonProps: { variant: "primaryInverse", textContent: t("ui.onlySave") },
                      cancelButtonProps: { variant: "secondaryInverse" },
                    }}
                    aria-label={"Edit Reference Number"}
                    onCancel={(previousValue) => onReferenceNumberChange(previousValue)}
                  />
                </HStack>
              </HStack>
            </Flex>
          </HStack>
          <Flex direction="column" align="flex-end" justify="space-between">
            <Stack direction={{ base: "column", lg: "row" }} align={{ base: "flex-end", lg: "center" }}>
              <BrowserSearchPrompt />
              <Button variant="ghost" color="white" onClick={onContactsOpen}>
                <Info size={20} />
                {t("permitApplication.show.contactsSummary")}
              </Button>
              <SubmissionDownloadModal permitApplication={currentPermitApplication} review />
              <Button onClick={() => navigate(-1)}>
                {t("ui.back")}
                <CaretRight />
              </Button>
            </Stack>
            {currentPermitApplication.isSubmitted && currentPermitApplication.jurisdiction.externalApiEnabled && (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="tertiaryInverse">
                    {t("ui.options")}
                    <CaretDown />
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item
                        icon={<ArrowsClockwise size={16} />}
                        onSelect={handleRetriggerWebhook}
                        disabled={isRetriggeringWebhook}
                        color="text.primary"
                        value="item-0"
                      >
                        {isRetriggeringWebhook
                          ? t("permitApplication.show.retriggeringWebhook")
                          : t("permitApplication.show.retriggerWebhook")}
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            )}
          </Flex>
        </Flex>
        {!isReadOnly && revisionMode && (
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
              <Button fontSize="sm" h={8} p={1} variant="secondary" onClick={() => setHideRevisionList((cur) => !cur)}>
                {hideRevisionList ? t("permitApplication.show.showList") : t("permitApplication.show.hideList")}
                {hideRevisionList ? <CaretDown /> : <CaretUp />}
              </Button>
              <Separator orientation="vertical" height="24px" mx={4} borderColor="greys.grey01" />
            </Flex>
            <Flex align="center" gap={2} flex={1} justify="flex-end" ref={sendRevisionContainerRef}></Flex>
          </Flex>
        )}
      </Flex>
      <Box
        id="sidebar-and-form-container"
        css={{
          "& &:after": { content: `""`, display: "block", clear: "both" },
        }}
      >
        {!isReadOnly && revisionMode && !hideRevisionList ? (
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
              readOnly={isReadOnly}
              renderTopButtons={() => {
                const collaboratorsButton = (
                  <CollaboratorsSidebar
                    permitApplication={currentPermitApplication}
                    collaborationType={ECollaborationType.review}
                    triggerButtonProps={{
                      variant: "secondary",
                    }}
                  />
                )

                if (isReadOnly) {
                  return (
                    <HStack gap={6}>
                      {canStartReview && (
                        <Button
                          variant="callout"
                          onClick={handleStartReview}
                          loading={isStartingReview}
                          loadingText={t("permitApplication.show.startingReview")}
                        >
                          <Swap />
                          {t("permitApplication.show.readyForReview")}
                        </Button>
                      )}
                      {collaboratorsButton}
                    </HStack>
                  )
                }

                return (
                  <HStack gap={6}>
                    {!revisionMode && (
                      <Button variant="callout" onClick={() => setRevisionMode(true)}>
                        <NotePencil />
                        {currentPermitApplication.isRevisionsRequested
                          ? t("permitApplication.show.viewRevisionRequests")
                          : t("permitApplication.show.requestRevisions")}{" "}
                        {currentPermitApplication?.latestRevisionRequests?.length > 0 &&
                          `(${currentPermitApplication.latestRevisionRequests.length})`}
                      </Button>
                    )}
                    {collaboratorsButton}
                  </HStack>
                )
              }}
              updateCollaborationAssignmentNodes={updateRequirementBlockAssignmentNode}
            />
          </Flex>
        )}
      </Box>
      {isContactsOpen && (
        <ContactSummaryModal
          open={isContactsOpen}
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
