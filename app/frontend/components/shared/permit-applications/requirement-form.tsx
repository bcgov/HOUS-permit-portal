import { Box, Button, Center, Flex, Link, Text, useDisclosure } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"

import { ArrowSquareOut } from "@phosphor-icons/react"
import { format } from "date-fns"
import * as R from "ramda"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { EFileUploadAttachmentType, EFlashMessageStatus, EStepCodeType } from "../../../types/enums"
import { IErrorsBoxData } from "../../../types/types"
import { getOptionalElectivesByPanelId } from "../../../utils/early-access-view-optional-electives"
import { getCompletedBlocksFromForm, getRequirementByKey } from "../../../utils/formio-component-traversal"
import { singleRequirementFormJson, singleRequirementSubmissionData } from "../../../utils/formio-helpers"
import { downloadFileFromStorage } from "../../../utils/utility-functions"
import { CompareRequirementsBox } from "../../domains/permit-application/compare-requirements-box"
import { ErrorsBox } from "../../domains/permit-application/errors-box"
import { BuilderBottomFloatingButtons } from "../../domains/requirement-template/builder-bottom-floating-buttons"
import { CustomMessageBox } from "../base/custom-message-box"
import { SharedSpinner } from "../base/shared-spinner"
import { Form, defaultOptions } from "../chefs"
import { ContactModal } from "../contact/contact-modal"
import { PreviousSubmissionModal } from "../revisions/previous-submission-modal"
import { OptionalElectivesModal } from "./optional-electives-modal"
import { PermitApplicationSubmitModal } from "./permit-application-submit-modal"
import { StepCodeSelectModal } from "./step-code-select-modal"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
  onCompletedBlocksChange?: (sections: any) => void
  formRef: any
  triggerSave?: (params?: { autosave?: boolean; skipPristineCheck?: boolean }) => Promise<boolean | void> | void
  showHelpButton?: boolean
  renderSaveButton?: () => JSX.Element
  isEditing?: boolean
  renderTopButtons?: () => React.ReactNode
  updateCollaborationAssignmentNodes?: () => void
  isEarlyAccess?: boolean
}

export const RequirementForm = observer(
  ({
    permitApplication,
    onCompletedBlocksChange,
    formRef,
    triggerSave,
    renderTopButtons,
    renderSaveButton,
    isEditing = false,
    updateCollaborationAssignmentNodes,
    isEarlyAccess = false,
  }: IRequirementFormProps) => {
    const {
      jurisdiction,
      submissionData,
      setSelectedTabIndex,
      indexOfBlockId,
      formJson,
      blockClasses,
      formattedFormJson,
      isDraft,
      previousSubmissionVersion,
      selectedSubmissionVersion,
      previousToSelectedSubmissionVersion,
      inboxEnabled,
      sandbox,
    } = permitApplication

    const shouldShowDiff = permitApplication?.shouldShowApplicationDiff(isEditing)
    const userShouldSeeDiff = permitApplication?.currentUserShouldSeeApplicationDiff

    const pastVersion = previousToSelectedSubmissionVersion || previousSubmissionVersion
    const isMounted = useMountStatus()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const boxRef = useRef<HTMLDivElement>(null)

    const [wrapperClickCount, setWrapperClickCount] = useState(0)
    const [errorBoxData, setErrorBoxData] = useState<IErrorsBoxData[]>([]) // an array of Labels and links to the component
    const [imminentSubmission, setImminentSubmission] = useState(null)
    const [floatErrorBox, setFloatErrorBox] = useState(false)
    const [hasErrors, setHasErrors] = useState(false)
    const [autofillContactKey, setAutofillContactKey] = useState(null)
    const [previousSubmissionKey, setPreviousSubmissionKey] = useState(null)
    const [firstComponentKey, setFirstComponentKey] = useState(null)
    const [isCollapsedAll, setIsCollapsedAllState] = useState(false)

    // Early-access only: "View optional electives" modal state
    const {
      isOpen: isOptionalElectivesOpen,
      onOpen: onOptionalElectivesOpen,
      onClose: onOptionalElectivesClose,
    } = useDisclosure()
    const [optionalElectivesModalData, setOptionalElectivesModalData] = useState<{
      blockTitle?: string
      labels: string[]
    } | null>(null)

    const currentSubmissionData = useMemo(() => {
      return R.clone(submissionData)
    }, [submissionData])

    const pastClonedDataCache = useRef(new Map())

    const displayedSubmissionData = useMemo(() => {
      if (selectedSubmissionVersion) {
        const cacheKey = selectedSubmissionVersion.id
        if (pastClonedDataCache.current.has(cacheKey)) {
          return pastClonedDataCache.current.get(cacheKey)
        } else {
          const clonedData = R.clone(selectedSubmissionVersion.submissionData)
          pastClonedDataCache.current.set(cacheKey, clonedData)
          return clonedData
        }
      } else {
        return currentSubmissionData
      }
    }, [selectedSubmissionVersion, currentSubmissionData])

    const [unsavedSubmissionData, setUnsavedSubmissionData] = useState(() => R.clone(submissionData))

    const handleSetUnsavedSubmissionData = (data) => {
      permitApplication.setIsDirty(true)
      setUnsavedSubmissionData(data)
    }

    const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()
    const {
      isOpen: isPreviousSubmissionOpen,
      onOpen: onPreviousSubmissionOpen,
      onClose: onPreviousSubmissionClose,
    } = useDisclosure()

    const infoBoxData = permitApplication.diffToInfoBoxData

    useEffect(() => {
      if (shouldShowDiff && userShouldSeeDiff) {
        permitApplication.fetchDiff()
      }
    }, [])

    useEffect(() => {
      setUnsavedSubmissionData(displayedSubmissionData)
      // We don't want to trigger a re-render if the permitApplication itself changes, only if the derived data changes
    }, [displayedSubmissionData])

    useEffect(() => {
      // The box observers need to be re-registered whenever a panel is collapsed
      // This triggers a re-registration whenever the body of the box is clicked
      // Click listener must be registered this way because formIO prevents bubbling

      const box = boxRef.current
      const handleClick = () => {
        setWrapperClickCount((n) => n + 1)
      }
      box?.addEventListener("click", handleClick)
      return () => {
        box?.removeEventListener("click", handleClick)
      }
    }, [])

    useEffect(() => {
      if (hasErrors) {
        window.addEventListener("scroll", onScroll)
      } else {
        window.removeEventListener("scroll", onScroll)
      }
      return () => {
        window.removeEventListener("scroll", onScroll)
      }
    }, [hasErrors])

    useEffect(() => {
      // This useEffect registers the intersection observers for the panels
      // It uses a thin line running across the middle of the screen
      // and detects when this line covers at least a small percentage of the panel

      // Problems with render timing necessitates the use of this isMounted state
      if (!isMounted) return

      const formComponentNodes = document.querySelectorAll(".formio-component")

      const blockNodes = Array.from(formComponentNodes).filter((node) =>
        Array.from(node.classList).some((className) => blockClasses.includes(className))
      )
      const viewportHeight = window.innerHeight // Get the viewport height
      const topValue = -viewportHeight / 2 + 5
      const bottomValue = -viewportHeight / 2 + 5
      const rootMarginValue = `${topValue}px 0px ${bottomValue}px 0px`
      const blockOptions = {
        rootMargin: rootMarginValue,
        threshold: 0.0001, // Adjust threshold based on needs
      }

      const blockObserver = new IntersectionObserver(handleBlockIntersection, blockOptions)

      Object.values(blockNodes).forEach((ref) => {
        if (ref) {
          blockObserver.observe(ref)
        }
      })

      return () => {
        blockObserver.disconnect()
      }
    }, [formJson, isMounted, window.innerHeight, wrapperClickCount])

    const handleOpenStepCodePart3 = async (_event) => {
      await triggerSave?.()
      if (isEarlyAccess) {
        alert(t("site.earlyAccessStepCodePreviewNotAvailable"))
      } else {
        navigate("part-3-step-code")
      }
    }

    const handleOpenStepCodePart9 = async (_event) => {
      await triggerSave?.()
      if (isEarlyAccess) {
        alert(t("site.earlyAccessStepCodePreviewNotAvailable"))
      } else {
        navigate("part-9-step-code")
      }
    }

    const handleOpenContactAutofill = async (event) => {
      setAutofillContactKey(event.detail.key)
      onContactsOpen()
    }

    const handleOpenPreviousSubmission = async (event) => {
      setPreviousSubmissionKey(event.detail.key)
      onPreviousSubmissionOpen()
    }

    const [isStepCodeSelectOpen, setIsStepCodeSelectOpen] = useState(false)
    const [stepCodeSelectType, setStepCodeSelectType] = useState<EStepCodeType>(EStepCodeType.part9StepCode)
    const handleOpenExistingStepCode = async (event) => {
      const incoming = event?.detail?.stepCodeType as EStepCodeType
      setStepCodeSelectType(
        incoming === EStepCodeType.part3StepCode ? EStepCodeType.part3StepCode : EStepCodeType.part9StepCode
      )
      setIsStepCodeSelectOpen(true)
    }

    const handleSelectExistingStepCode = async (stepCodeId: string) => {
      await triggerSave?.()
      // Assign by updating the StepCode's permitApplicationId (belongs_to association)
      // @ts-ignore method added on model
      const ok = await permitApplication.assignExistingStepCode(stepCodeId)
      if (ok) setIsStepCodeSelectOpen(false)
    }

    const handleDownloadRequirementDocument = async (event) => {
      downloadFileFromStorage({
        model: EFileUploadAttachmentType.RequirementDocument,
        modelId: event.detail.id,
        filename: event.detail.filename,
      })
    }

    const handleOpenResourceLink = (event) => {
      window.open(event.detail.url, "_blank", "noopener,noreferrer")
    }

    const handleDownloadResourceDocument = async (event) => {
      downloadFileFromStorage({
        model: EFileUploadAttachmentType.ResourceDocument,
        modelId: event.detail.id,
        filename: event.detail.filename,
      })
    }

    const optionalElectivesByPanelId = useMemo(() => {
      if (!isEarlyAccess) return new Map<string, { blockTitle?: string; labels: string[] }>()
      return getOptionalElectivesByPanelId(formattedFormJson)
    }, [formattedFormJson, isEarlyAccess])

    const handleOpenOptionalElectives = useCallback(
      (event) => {
        const panelId = event?.detail?.panelId as string | undefined
        if (!panelId) return

        const data = optionalElectivesByPanelId.get(panelId) || { labels: [] }
        setOptionalElectivesModalData(data)
        onOptionalElectivesOpen()
      },
      [onOptionalElectivesOpen, optionalElectivesByPanelId]
    )

    useEffect(() => {
      // Wrapper to handle event listener type compatibility and deps
      const handleOpenOptionalElectivesWrapper = (e: any) => handleOpenOptionalElectives(e)

      document.addEventListener("openStepCode", handleOpenStepCodePart9)
      document.addEventListener("openStepCodePart3", handleOpenStepCodePart3)
      document.addEventListener("openAutofillContact", handleOpenContactAutofill)
      document.addEventListener("openPreviousSubmission", handleOpenPreviousSubmission)
      document.addEventListener("openExistingStepCode", handleOpenExistingStepCode)
      document.addEventListener("downloadRequirementDocument", handleDownloadRequirementDocument)
      document.addEventListener("openResourceLink", handleOpenResourceLink)
      document.addEventListener("downloadResourceDocument", handleDownloadResourceDocument)

      if (isEarlyAccess) {
        document.addEventListener("openOptionalElectives", handleOpenOptionalElectivesWrapper)
      }

      return () => {
        document.removeEventListener("openStepCode", handleOpenStepCodePart9)
        document.removeEventListener("openStepCodePart3", handleOpenStepCodePart3)
        document.removeEventListener("openAutofillContact", handleOpenContactAutofill)
        document.removeEventListener("openPreviousSubmission", handleOpenPreviousSubmission)
        document.removeEventListener("openExistingStepCode", handleOpenExistingStepCode)
        document.removeEventListener("downloadRequirementDocument", handleDownloadRequirementDocument)
        document.removeEventListener("openResourceLink", handleOpenResourceLink)
        document.removeEventListener("downloadResourceDocument", handleDownloadResourceDocument)

        if (isEarlyAccess) {
          document.removeEventListener("openOptionalElectives", handleOpenOptionalElectivesWrapper)
        }
      }
    }, [isEarlyAccess, handleOpenOptionalElectives])

    const setIsCollapsedAll = (isCollapsedAll: boolean) => {
      if (isCollapsedAll) {
        document.querySelectorAll(".formio-collapse-icon.fa-minus-square-o").forEach((el: HTMLDivElement) => el.click())
      } else {
        document.querySelectorAll(".formio-collapse-icon.fa-plus-square-o").forEach((el: HTMLDivElement) => el.click())
      }
      setIsCollapsedAllState(isCollapsedAll)
    }

    const mapErrorBoxData = (errors) =>
      errors.map((error) => {
        return { label: error.component.label, id: error.component.id, class: error.component.class }
      })

    function handleBlockIntersection(entries: IntersectionObserverEntry[]) {
      const entry = entries.filter((en) => en.isIntersecting)[0]
      if (!entry) return

      const itemWithSectionClassName = Array.from(entry.target.classList).find(
        (className) =>
          className.includes("formio-component-formSubmissionDataRSTsection") ||
          className.includes("formio-component-section-signoff-key")
      )

      if (itemWithSectionClassName) {
        const classNameParts = itemWithSectionClassName.split("|")
        const blockId = classNameParts[classNameParts.length - 1].slice(-36)
        setSelectedTabIndex(indexOfBlockId(blockId))
      }
    }

    const onFormSubmit = async (submission: any) => {
      setHasErrors(null)
      setImminentSubmission(submission)
      onOpen()
    }

    const onModalSubmit = async () => {
      if (await permitApplication.submit({ submissionData: imminentSubmission })) {
        navigate(`/permit-applications/${permitApplication.id}/sucessful-submission`)
      }
    }

    const onBlur = (containerComponent) => {
      if (onCompletedBlocksChange) {
        onCompletedBlocksChange(getCompletedBlocksFromForm(containerComponent.root))
      }
    }
    const onScroll = (event) => {
      setFloatErrorBox(hasErrors && isFirstComponentNearTopOfView(firstComponentKey))
    }

    const onChange = (changedEvent) => {
      const instance = changedEvent?.changed?.instance
      const component = changedEvent?.changed?.component
      const root = instance?.root

      if (!root || !component) {
        return // Exit if necessary objects are not available
      }

      const componentType = component.type

      if (componentType === "selectboxes" || componentType === "simplefile") {
        if (onCompletedBlocksChange) {
          onCompletedBlocksChange(getCompletedBlocksFromForm(root))
        }
        setErrorBoxData(mapErrorBoxData(root.errors))

        if (componentType === "simplefile") {
          // https://github.com/formio/formio.js/blob/4.19.x/src/components/file/File.unit.js
          // formio `pristine` is not set for file updates
          // using `setPristine(false)` causes the entire form to validate so instead, we use a separate dirty state
          // trigger save to rerun compliance and save file
          triggerSave?.({ autosave: true, skipPristineCheck: true })
        }
      }
    }

    const onInitialized = (event) => {
      if (!formRef.current) return

      updateCollaborationAssignmentNodes?.()

      if (onCompletedBlocksChange) {
        onCompletedBlocksChange(getCompletedBlocksFromForm(formRef.current))
      }
    }

    const formReady = (rootComponent) => {
      formRef.current = rootComponent

      rootComponent.on("change", (_) => {
        // whenever a form data changes, we update the state of ErrorBox with the new error information
        setErrorBoxData(mapErrorBoxData(formRef.current.errors))
      })

      rootComponent.on("submitError", (error) => {
        // when the form attempts to submit but has validation errors, we set a flag to show ErrorBox
        setHasErrors(true)
        setErrorBoxData(mapErrorBoxData(formRef.current.errors))
      })

      const firstComponent = rootComponent.form.components[0]
      setFirstComponentKey(firstComponent.key)
    }

    let permitAppOptions = {
      ...defaultOptions,
      ...(isDraft ? { readOnly: shouldShowDiff } : { readOnly: false }),
      // readonly loggic depends on formattedJson for submitted applications
    }
    permitAppOptions.componentOptions.simplefile.config["formCustomOptions"] = {
      persistFileUploadAction: "PATCH",
      persistFileUploadUrl: `/api/permit_applications/${permitApplication.id}/upload_supporting_document`,
    }

    const handleUpdatePermitApplicationVersion = () => {
      if (permitApplication.showingCompareAfter) {
        permitApplication.resetCompareAfter()
      } else {
        permitApplication.updateVersion()
      }
    }
    const showVersionDiffContactWarning = shouldShowDiff && !userShouldSeeDiff
    return (
      <>
        <Flex
          direction="column"
          as={"section"}
          flex={1}
          className={`form-wrapper ${floatErrorBox ? "float-on" : "float-off"} ${isEarlyAccess ? "early-access-requirement-form" : ""}`}
          mb="40vh"
          mx="auto"
          pl={{ base: "10" }}
          pr={{ base: "10", xl: "var(--app-permit-form-right-white-space)" }}
          width="full"
          maxWidth="container.lg"
          gap={8}
          ref={boxRef}
          id="requirement-form-wrapper"
          sx={{
            "[id^='error-list-'].alert.alert-danger > p::before": {
              content: `"${t("requirementTemplate.edit.errorsBox.title", { count: errorBoxData.length })}"`,
            },
          }}
        >
          {renderTopButtons && renderTopButtons()}
          {permitApplication.isLoading && (
            <Center position="fixed" top={0} left={0} right={0} zIndex={12} h="100vh" w="full" bg="greys.overlay">
              <SharedSpinner h={24} w={24} />
            </Center>
          )}
          <ErrorsBox data={errorBoxData} />
          {shouldShowDiff &&
            userShouldSeeDiff &&
            (permitApplication.diff ? (
              <CompareRequirementsBox
                data={infoBoxData}
                handleUpdatePermitApplicationVersion={handleUpdatePermitApplicationVersion}
                showingCompareAfter={permitApplication.showingCompareAfter}
                handleClickDismiss={() => {
                  permitApplication.resetDiff()
                }}
                isUpdatable={permitApplication.isDraft}
              />
            ) : (
              <SharedSpinner position="fixed" right={24} top="50vh" zIndex={12} />
            ))}
          {permitApplication?.isRevisionsRequested && (
            <CustomMessageBox
              description={t("permitApplication.show.revisionsWereRequested", {
                date: format(permitApplication.revisionsRequestedAt, "MMM d, yyyy h:mm a"),
              })}
              status={EFlashMessageStatus.warning}
            />
          )}
          {showVersionDiffContactWarning && (
            <CustomMessageBox
              description={t("permitApplication.show.versionDiffContactWarning")}
              status={EFlashMessageStatus.warning}
            />
          )}
          {!inboxEnabled && !sandbox && !isEarlyAccess && (
            <CustomMessageBox
              title={t("permitApplication.show.inboxDisabledTitle")}
              description={t("permitApplication.show.inboxDisabled")}
              status={EFlashMessageStatus.error}
            />
          )}
          {!inboxEnabled && !sandbox && isEarlyAccess && (
            <CustomMessageBox
              title={t("permitApplication.show.inboxDisabledTitleEarlyAccess")}
              description={
                <Trans
                  t={t}
                  i18nKey={"permitApplication.show.inboxDisabledEarlyAccess"}
                  components={{
                    1: (
                      <Button
                        sx={{
                          span: {
                            ml: 0,
                          },
                        }}
                        as={Link}
                        rightIcon={<ArrowSquareOut />}
                        href={"/projects/"}
                        variant={"link"}
                        target="_blank"
                        color={"text.primary !important"}
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                />
              }
              status={EFlashMessageStatus.warning}
            />
          )}
          {permitApplication?.isSubmitted ? (
            <CustomMessageBox
              description={t("permitApplication.show.wasSubmitted", {
                date: format(permitApplication.submittedAt, "MMM d, yyyy h:mm a"),
                jurisdictionName: jurisdiction.qualifiedName,
              })}
              status={EFlashMessageStatus.info}
            />
          ) : (
            <CustomMessageBox
              title={
                jurisdiction &&
                t("permitApplication.show.submittingTo.title", { jurisdictionName: jurisdiction?.qualifiedName })
              }
              description={
                <Trans
                  t={t}
                  i18nKey={"permitApplication.show.submittingTo.description"}
                  components={{
                    1: (
                      <Button
                        sx={{
                          span: {
                            ml: 0,
                          },
                        }}
                        as={Link}
                        rightIcon={<ArrowSquareOut />}
                        href={
                          "https://www2.gov.bc.ca/gov/content/governments/local-governments/planning-land-use/land-use-regulation/zoning-bylaws"
                        }
                        variant={"link"}
                        target="_blank"
                        color={"text.primary !important"}
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                />
              }
              status={EFlashMessageStatus.info}
            />
          )}
          <Box bg="greys.grey03" p={3} borderRadius="sm">
            <Text fontStyle="italic">
              {t("site.foippaWarning")}
              <Link href={"mailto:" + t("site.contactEmail")} isExternal>
                {t("site.contactEmail")}
              </Link>
            </Text>
          </Box>
          <Form
            key={permitApplication.formFormatKey}
            form={formattedFormJson}
            formReady={formReady}
            /* Needs cloned submissionData otherwise it's not possible to use data grid as mst props can't be mutated*/
            submission={unsavedSubmissionData}
            onSubmit={onFormSubmit}
            options={permitAppOptions}
            onBlur={onBlur}
            onChange={onChange}
            onInitialized={onInitialized}
          />
        </Flex>

        <OptionalElectivesModal
          isOpen={isOptionalElectivesOpen}
          onClose={onOptionalElectivesClose}
          data={optionalElectivesModalData}
        />

        <BuilderBottomFloatingButtons
          isCollapsedAll={isCollapsedAll}
          setIsCollapsedAll={setIsCollapsedAll}
          renderSaveButton={renderSaveButton}
        />
        {isOpen && (
          <PermitApplicationSubmitModal
            permitApplication={permitApplication}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onModalSubmit}
          />
        )}
        {isContactsOpen && (
          <ContactModal
            isOpen={isContactsOpen}
            onOpen={onContactsOpen}
            onClose={onContactsClose}
            autofillContactKey={autofillContactKey}
            permitApplication={permitApplication}
            submissionState={unsavedSubmissionData}
            setSubmissionState={handleSetUnsavedSubmissionData}
          />
        )}

        <StepCodeSelectModal
          isOpen={isStepCodeSelectOpen}
          onClose={() => setIsStepCodeSelectOpen(false)}
          stepCodeType={stepCodeSelectType}
          onSelect={handleSelectExistingStepCode}
        />

        {isPreviousSubmissionOpen && (
          <PreviousSubmissionModal
            isOpen={isPreviousSubmissionOpen}
            onOpen={onPreviousSubmissionOpen}
            onClose={onPreviousSubmissionClose}
            requirementJson={singleRequirementFormJson(
              getRequirementByKey(pastVersion.formJson, previousSubmissionKey)
            )}
            submissionData={singleRequirementSubmissionData(pastVersion.submissionData, previousSubmissionKey)}
          />
        )}
      </>
    )
  }
)

function isFirstComponentNearTopOfView(firstComponentKey) {
  const firstComponentElement = document.querySelector(`.formio-component-${firstComponentKey}`)
  if (firstComponentElement) {
    const firstComponentElTopY = firstComponentElement.getBoundingClientRect().y
    const buffer = 400 // this buffer is to account for the transition-delay of displaying ErrorBox
    return firstComponentElTopY < buffer
  } else {
    return false
  }
}
