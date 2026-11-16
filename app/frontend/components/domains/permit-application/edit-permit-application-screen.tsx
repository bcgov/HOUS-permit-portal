import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Spacer,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretDown, CaretRight, CaretUp, FloppyDiskBack, Info, NotePencil, Users } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { requirementTypeToFormioType } from "../../../constants"
import { COMPLETTION_SECTION_KEY } from "../../../constants/formio-constants"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { useInterval } from "../../../hooks/use-interval"
import { useMst, useServerAPI } from "../../../setup/root"
import { stickyBelowNavBar } from "../../../styles/nav-bar-offset"
import { ICustomEventMap } from "../../../types/dom"
import { ECustomEvents, ERequirementType } from "../../../types/enums"
import { IProjectGrant } from "../../../types/types"
import { findPidComponentKey } from "../../../utils/formio-component-traversal"
import { handleScrollToBottom, handleScrollToTop } from "../../../utils/utility-functions"
import { CopyableValue } from "../../shared/base/copyable-value"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { FloatingHelpDrawer } from "../../shared/floating-help-drawer"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { BrowserSearchPrompt } from "../../shared/permit-applications/browser-search-prompt"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"
import { PermitApplicationSubmitModal } from "../../shared/permit-applications/permit-application-submit-modal"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"
import {
  IReviewSubmitActions,
  ReviewAndSubmitRevisedApplicationScreen,
} from "../../shared/revisions/review-and-submit-revised-application-screen"
import { ApplicationPeoplePanel } from "./application-people-panel"
import { BlockAccessPanel } from "./block-access-panel"
import { ChecklistSideBar } from "./checklist-sidebar"
import { ContactSummaryModal } from "./contact-summary-modal"
import { setupEnergyStepCodeReportLink } from "./energy-step-code-report-link"
import { RevisionSideBar } from "./revision-sidebar"
import { SubmissionDownloadModal } from "./submission-download-modal"

interface IEditPermitApplicationScreenProps {}

type TPermitApplicationMetadataForm = {
  nickname: string
}

const countGrantedPeople = (grants: IProjectGrant[]) =>
  new Set(grants.filter((grant) => grant.kind !== "invite").map((grant) => grant.projectMembershipId)).size

export const EditPermitApplicationScreen = observer(({}: IEditPermitApplicationScreenProps) => {
  const { userStore, uiStore } = useMst()
  const api = useServerAPI()
  const { scrollToSelector, setScrollToSelector } = uiStore
  const currentUser = userStore.currentUser
  const { currentPermitApplication, error } = usePermitApplication()
  const { t } = useTranslation()

  const formRef = useRef(null)
  const navigate = useNavigate()

  const acknowledgedElectivesKey = useRef("")
  useEffect(() => {
    if (!currentUser || !currentPermitApplication?.isFullyLoaded) return
    if (!currentPermitApplication.currentUserAccess?.editApplication) return

    const changeId = currentPermitApplication.unseenCustomizationChangeId
    if (!changeId || !currentPermitApplication.unseenElectiveFieldIds.length) return

    const key = `${currentPermitApplication.id}:${changeId}`
    if (acknowledgedElectivesKey.current === key) return
    acknowledgedElectivesKey.current = key
    void currentPermitApplication.acknowledgePublishedElectives()
  }, [currentPermitApplication, currentPermitApplication?.isFullyLoaded, currentUser])

  useEffect(() => {
    if (scrollToSelector) {
      setTimeout(() => {
        const element = document.querySelector(scrollToSelector)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
        setScrollToSelector("")
      }, 100)
    }
  }, [scrollToSelector])

  const getDefaultPermitApplicationMetadataValues = () => ({ nickname: currentPermitApplication?.nickname })

  const { register, watch, setValue, reset } = useForm<TPermitApplicationMetadataForm>({
    mode: "onChange",
    defaultValues: getDefaultPermitApplicationMetadataValues(),
  })

  const [completedBlocks, setCompletedBlocks] = useState({})

  const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()

  const [processEventOnLoad, setProcessEventOnLoad] = useState<CustomEvent | null>(null)
  const {
    isOpen: isSubmitBlockedModalOpen,
    onOpen: onSubmitBlockedModalOpen,
    onClose: onSubmitBlockedModalClose,
  } = useDisclosure()
  const [isReviewingSubmit, setIsReviewingSubmit] = useState(false)
  const [peopleOpen, setPeopleOpen] = useState(false)
  const [blockAccessId, setBlockAccessId] = useState<string | null>(null)
  const [grantedPeopleCount, setGrantedPeopleCount] = useState(0)
  const [imminentSubmission, setImminentSubmission] = useState(null)
  const reviewSubmitActionsRef = useRef<IReviewSubmitActions | null>(null)

  useEffect(() => {
    const applicationId = currentPermitApplication?.id
    if (!applicationId) return
    let cancelled = false
    const load = async () => {
      const response = await api.fetchProjectGrants(applicationId)
      if (cancelled || !response.ok) return
      setGrantedPeopleCount(countGrantedPeople(response.data?.data ?? []))
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [currentPermitApplication?.id])

  useEffect(() => {
    setBlockAccessId(null)
  }, [currentPermitApplication?.id])

  useEffect(() => {
    const handleEditBlockAccess = (event: Event) => {
      const requirementBlockId = (event as CustomEvent<{ requirementBlockId?: string }>).detail?.requirementBlockId
      if (!currentPermitApplication?.currentUserAccess?.editApplication) return
      if (!requirementBlockId) return
      setPeopleOpen(false)
      setBlockAccessId(requirementBlockId)
    }
    const handleHeaderClick = (event: Event) => {
      const target = event.target as HTMLElement | null
      const link = target?.closest?.(".edit-block-access") as HTMLElement | null
      if (!link) return
      event.preventDefault()
      event.stopPropagation()
      if (event.type !== "click") return
      const panel = link.closest(".formio-component-panel")
      const requirementBlockId = panel
        ? Array.from(panel.classList)
            .find((className) => className.includes("|RB"))
            ?.split("|RB")
            .at(-1)
        : null
      if (!requirementBlockId) return
      document.dispatchEvent(new CustomEvent("editBlockAccess", { detail: { requirementBlockId } }))
    }
    document.addEventListener("editBlockAccess", handleEditBlockAccess)
    document.addEventListener("click", handleHeaderClick, true)
    document.addEventListener("mousedown", handleHeaderClick, true)
    return () => {
      document.removeEventListener("editBlockAccess", handleEditBlockAccess)
      document.removeEventListener("click", handleHeaderClick, true)
      document.removeEventListener("mousedown", handleHeaderClick, true)
    }
  }, [currentPermitApplication?.currentUserAccess?.editApplication])

  const handlePermitApplicationUpdate = (_event: ICustomEventMap[ECustomEvents.handlePermitApplicationUpdate]) => {
    if (formRef.current) {
      if (_event.detail && _event.detail.id == currentPermitApplication?.id) {
        import.meta.env.DEV && console.log("[DEV] setting formio data", _event.detail)
        handleAutomatedComplianceUpdate(_event.detail.frontEndFormUpdate)
      }
    } else {
      import.meta.env.DEV && console.log("[DEV] re-enqueue to process later", _event)
      setProcessEventOnLoad(_event)
    }
  }

  useEffect(() => {
    if (formRef.current && processEventOnLoad) {
      handlePermitApplicationUpdate(processEventOnLoad)
      setProcessEventOnLoad(null)
    }
  }, [formRef.current, processEventOnLoad])

  useEffect(() => {
    document.addEventListener<ECustomEvents.handlePermitApplicationUpdate>(
      ECustomEvents.handlePermitApplicationUpdate,
      handlePermitApplicationUpdate
    )
    return () => {
      document.removeEventListener(ECustomEvents.handlePermitApplicationUpdate, handlePermitApplicationUpdate)
    }
  }, [currentPermitApplication?.id])

  const [hideRevisionList, setHideRevisionList] = useState(false)

  const nicknameWatch = watch("nickname")
  const isStepCode = R.test(/step-code/, window.location.pathname)
  setupEnergyStepCodeReportLink()
  const handleSave = async ({
    autosave,
    skipPristineCheck,
  }: {
    autosave?: boolean
    skipPristineCheck?: boolean
  } = {}) => {
    if (currentPermitApplication.isSubmitted || isStepCode || isContactsOpen) return
    const formio = formRef.current
    if (formio.pristine && !skipPristineCheck && !isDirty) return true

    const submissionData = formio.data
    try {
      const response = await currentPermitApplication.update({
        submissionData: { data: submissionData },
        nickname: nicknameWatch,
        autosave,
      })
      if (response.ok && response.data.data.frontEndFormUpdate) {
        updateFormIoValues(formio, response.data.data.frontEndFormUpdate)
        //update file hashes that have been changed
      }
      setIsDirty(false)
      formio.setPristine(true)
      return response.ok
    } catch (e) {
      return false
    }
  }

  const handleAutomatedComplianceUpdate = (frontEndFormUpdate) => {
    if (R.isNil(frontEndFormUpdate)) {
      return
    }
    const formio = formRef.current
    updateFormIoValues(formio, frontEndFormUpdate)
  }

  const updateFormIoValues = (formio, frontEndFormUpdate) => {
    for (const [key, value] of Object.entries(frontEndFormUpdate)) {
      let componentToSet = formio.getComponent(key)

      if (key.endsWith("additional_pid_info")) {
        if (componentToSet) {
          const pidKey = findPidComponentKey(componentToSet.component)
          if (pidKey) {
            const dataValue = componentToSet.getValue()

            if (!dataValue || dataValue.length === 0) {
              componentToSet.addRow()
            }
            componentToSet = formio.getComponent(pidKey)
          }
        }
      }

      if (!R.isNil(value)) {
        if (!R.isNil(componentToSet)) {
          componentSetValue(componentToSet, value)
        }
      }

      // need to update the computed compliance result
      // even if value is null, as that indicates autocompliance ran
      // but result wasn't found

      updateComputedComplianceResult(componentToSet, value)
    }
  }

  const updateComputedComplianceResult = (componentToSet, newValue) => {
    if (!componentToSet) {
      return
    }

    const originalComputedComplianceResult = componentToSet?.component?.computedComplianceResult

    // trigger a redraw to update auto compliance if result changed
    if (componentToSet.component && !R.equals(originalComputedComplianceResult, newValue)) {
      componentToSet.component.computedComplianceResult = newValue
      componentToSet?.triggerRedraw()
    }
  }

  //guard happens before this call to optimize code
  const componentSetValue = (componentToSet, newValue) => {
    // file value setting is handled by s3 so no need to set value for files

    if (
      !componentToSet ||
      componentToSet?.component?.type === "file" ||
      componentToSet?.component?.type === requirementTypeToFormioType[ERequirementType.file]
    ) {
      return
    }

    //if it is a computed compliance
    if (componentToSet?.getValue && (componentToSet.getValue() == "" || R.isNil(componentToSet.getValue()))) {
      import.meta.env.DEV && console.log("[DEV] setting computed compliance value", componentToSet, newValue)
      componentToSet.setValue(newValue)
      componentToSet?.triggerRedraw()
    }
  }

  const handleClickFinishLater = async () => {
    const success = await handleSave()
    if (success) {
      handleScrollToTop()
      navigate(parentProjectPath)
    }
  }

  useInterval(() => handleSave({ autosave: true }), 60000) // save progress every minute

  const permitHeaderRef = useRef()

  useEffect(() => {
    // sets the defaults subject to application load
    reset(getDefaultPermitApplicationMetadataValues())
  }, [currentPermitApplication?.nickname])

  useEffect(() => {
    const container = document.getElementById("permitApplicationFieldsContainer")
    if (!container) return

    if (currentPermitApplication?.isRevisionsRequested) {
      container.classList.add("revision-mode")
    } else {
      container.classList.remove("revision-mode")
    }
  }, [currentPermitApplication?.isRevisionsRequested])

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication?.isFullyLoaded) return <LoadingScreen />

  // @ts-ignore
  const permitHeaderHeight = permitHeaderRef?.current?.offsetHeight ?? 0

  const { tagsOrNickname, formJson, number, isSubmitted, isDirty, setIsDirty, isRevisionsRequested } =
    currentPermitApplication

  const doesUserHaveSubmissionPermission = !!currentPermitApplication.currentUserAccess?.editApplication
  const canEditPermitApplication =
    currentPermitApplication.isDraft &&
    doesUserHaveSubmissionPermission &&
    !currentPermitApplication.isViewingPastRequests

  const parentProjectPath = currentPermitApplication.projectId
    ? `/projects/${currentPermitApplication.projectId}/applications`
    : "/projects"
  const submitClickHandler = currentPermitApplication.canUserSubmit(currentUser)
    ? handleScrollToBottom
    : onSubmitBlockedModalOpen
  const showSubmitControl =
    isReviewingSubmit || formJson?.components?.some((section) => section.key === COMPLETTION_SECTION_KEY)
  const sidePanelOpen = peopleOpen || Boolean(blockAccessId)
  let sidebar = <ChecklistSideBar permitApplication={currentPermitApplication} completedBlocks={completedBlocks} />
  if (isReviewingSubmit && imminentSubmission) {
    sidebar = (
      <ReviewAndSubmitRevisedApplicationScreen
        permitApplication={currentPermitApplication}
        submission={imminentSubmission}
        onBack={() => setIsReviewingSubmit(false)}
        actionsRef={reviewSubmitActionsRef}
      />
    )
  } else if (isRevisionsRequested && !hideRevisionList) {
    sidebar = <RevisionSideBar permitApplication={currentPermitApplication} forSubmitter />
  }

  return (
    <Box as="main" id="submitter-view-permit">
      {!isStepCode && (
        <Flex
          id="permitHeader"
          direction="column"
          position="sticky"
          {...stickyBelowNavBar()}
          zIndex={12}
          ref={permitHeaderRef}
        >
          <Flex
            w="full"
            px={6}
            py={3}
            bg="theme.blue"
            justify="space-between"
            color="greys.white"
            position="sticky"
            top="0"
            zIndex={12}
            flexDirection={{ base: "column", md: "row" }}
          >
            <HStack gap={4} flex={1} minW={0} align="flex-start">
              <PermitApplicationStatusTag status={currentPermitApplication.status} />
              <Flex direction="column" w="full" minW={0}>
                <form>
                  <Tooltip
                    label={t("permitApplication.edit.clickToWriteNickname")}
                    placement="top-start"
                    isDisabled={!canEditPermitApplication}
                  >
                    <Box>
                      <EditableInputWithControls
                        w="full"
                        initialHint={t("permitApplication.edit.clickToWriteNickname")}
                        value={nicknameWatch || ""}
                        isDisabled={!canEditPermitApplication}
                        controlsProps={{
                          iconButtonProps: {
                            color: "greys.white",
                            display: canEditPermitApplication ? "block" : "none",
                          },
                        }}
                        editableInputProps={{
                          fontWeight: 700,
                          fontSize: "xl",
                          width: "100%",
                          ...register("nickname", {
                            maxLength: {
                              value: 256,
                              message: t("ui.invalidInput"),
                            },
                          }),

                          onSubmit: () => {
                            handleSave()
                          },
                          "aria-label": "Edit custom name",
                        }}
                        editablePreviewProps={{
                          fontWeight: 700,
                          fontSize: "xl",
                        }}
                        onEdit={() => {
                          setIsDirty(true)
                        }}
                        aria-label={"Edit custom name"}
                        onCancel={(previousValue) => setValue("nickname", previousValue)}
                      />
                    </Box>
                  </Tooltip>
                </form>

                <Text noOfLines={1}>{tagsOrNickname}</Text>
                <HStack flexWrap="wrap" rowGap={1} columnGap={4} align="center">
                  <CopyableValue value={number} label={t("permitApplication.fields.number")} />
                  {currentPermitApplication.referenceNumber && (
                    <CopyableValue
                      value={currentPermitApplication.referenceNumber}
                      label={t("permitApplication.referenceNumber")}
                    />
                  )}
                </HStack>
              </Flex>
            </HStack>
            {isSubmitted ? (
              <Stack direction={{ base: "column", lg: "row" }} align={{ base: "flex-end", lg: "center" }}>
                <BrowserSearchPrompt />
                <Button variant="ghost" leftIcon={<Info size={20} />} color="white" onClick={onContactsOpen}>
                  {t("permitApplication.show.contactsSummary")}
                </Button>{" "}
                {currentPermitApplication.currentUserAccess?.viewApplication && (
                  <SubmissionDownloadModal permitApplication={currentPermitApplication} />
                )}
                <RouterLinkButton to={parentProjectPath} variant="default" rightIcon={<CaretRight />}>
                  {t("permitApplication.show.goToProject")}
                </RouterLinkButton>
                <Link to={parentProjectPath}>
                  <Button rightIcon={<CaretRight />}>{t("ui.back")}</Button>
                </Link>
              </Stack>
            ) : (
              <HStack
                flexDir={{
                  base: "column",
                  md: "row",
                }}
                gap={4}
              >
                <BrowserSearchPrompt />
                <Button
                  variant="primary"
                  leftIcon={<Users />}
                  onClick={() => {
                    setBlockAccessId(null)
                    setPeopleOpen((open) => !open)
                  }}
                >
                  {t("permitApplication.people.buttonWithCount", { count: grantedPeopleCount })}
                </Button>
                <Button
                  variant="primary"
                  onClick={
                    isReviewingSubmit ? () => reviewSubmitActionsRef.current?.saveAndExit() : handleClickFinishLater
                  }
                  isDisabled={!isReviewingSubmit && currentPermitApplication.isViewingPastRequests}
                >
                  {isReviewingSubmit
                    ? t("permitApplication.show.revision.saveAndExit")
                    : t("permitApplication.edit.saveDraft")}
                </Button>
                {showSubmitControl && (
                  <Button
                    rightIcon={<CaretRight />}
                    onClick={isReviewingSubmit ? () => reviewSubmitActionsRef.current?.submit() : submitClickHandler}
                    isDisabled={isReviewingSubmit && currentPermitApplication.digitalSealChecks.pendingCount > 0}
                  >
                    {isReviewingSubmit
                      ? t("permitApplication.new.submitApplication")
                      : t("permitApplication.edit.submit")}
                  </Button>
                )}
                {!currentPermitApplication.canUserSubmit(currentUser) && isSubmitBlockedModalOpen && (
                  <PermitApplicationSubmitModal
                    permitApplication={currentPermitApplication}
                    isOpen={isSubmitBlockedModalOpen}
                    onClose={onSubmitBlockedModalClose}
                  />
                )}
              </HStack>
            )}
            <FloatingHelpDrawer top="auto" bottom="76px" right={sidePanelOpen ? "380px" : "20px"} />
          </Flex>
          {currentPermitApplication.isRevisionsRequested && !isReviewingSubmit && (
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
              <Flex width={"sidebar.revisionWidth"} align="center" gap={2}>
                <NotePencil size={24} />
                <Heading fontSize="lg" mt={2}>
                  {t("permitApplication.show.requestedRevisions")}
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
      )}
      <Flex id="sidebar-and-form-container" align="stretch" w="full">
        <Box
          flex={isReviewingSubmit ? 1 : undefined}
          flexShrink={isReviewingSubmit ? 1 : 0}
          minW={isReviewingSubmit ? 0 : undefined}
        >
          {sidebar}
        </Box>
        {formJson && (
          <Flex
            flex={1}
            direction="column"
            minW={0}
            pt={4}
            position={"relative"}
            id="permitApplicationFieldsContainer"
            display={isReviewingSubmit ? "none" : "flex"}
          >
            <RequirementForm
              formRef={formRef}
              permitApplication={currentPermitApplication}
              onCompletedBlocksChange={setCompletedBlocks}
              triggerSave={handleSave}
              showHelpButton
              forSubmitterEdit
              isEditing={currentPermitApplication?.isDraft}
              renderSaveButton={() => (
                <SaveButton
                  handleSave={handleSave}
                  isDisabled={isSubmitted || currentPermitApplication.isViewingPastRequests}
                />
              )}
              sideOffset={sidePanelOpen ? 360 : 0}
              onReviewSubmit={
                currentPermitApplication.canUserSubmit(currentUser)
                  ? (submission) => {
                      setImminentSubmission(submission)
                      setIsReviewingSubmit(true)
                      setPeopleOpen(false)
                      setBlockAccessId(null)
                    }
                  : undefined
              }
            />
          </Flex>
        )}
        {peopleOpen && (
          <ApplicationPeoplePanel
            permitApplication={currentPermitApplication}
            stickyHeaderHeight={permitHeaderHeight}
            onClose={() => setPeopleOpen(false)}
            onGrantsChange={(grants) => setGrantedPeopleCount(countGrantedPeople(grants))}
          />
        )}
        {blockAccessId && (
          <BlockAccessPanel
            permitApplication={currentPermitApplication}
            requirementBlockId={blockAccessId}
            stickyHeaderHeight={permitHeaderHeight}
            onClose={() => setBlockAccessId(null)}
            onGrantsChange={(grants) => setGrantedPeopleCount(countGrantedPeople(grants))}
          />
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

function SaveButton({ handleSave, isDisabled }) {
  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState

  const onSubmit = async () => {
    await handleSave({ skipPristineCheck: true })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Button
        variant="primary"
        leftIcon={<FloppyDiskBack />}
        type="submit"
        isLoading={isSubmitting}
        isDisabled={isSubmitting || isDisabled}
      >
        {t("ui.onlySave")}
      </Button>
    </form>
  )
}
