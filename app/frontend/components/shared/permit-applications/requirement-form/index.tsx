import { Box, Button, Center, Flex, Link, Text, useDisclosure } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"

import { ArrowSquareOut } from "@phosphor-icons/react"
import { format } from "date-fns"
import * as R from "ramda"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../../models/permit-application"
import { EFlashMessageStatus } from "../../../../types/enums"
import { IErrorsBoxData } from "../../../../types/types"
import { getRequirementByKey } from "../../../../utils/formio-component-traversal"
import {
  getEnergyStepCodeMethodFromData,
  singleRequirementFormJson,
  singleRequirementSubmissionData,
} from "../../../../utils/formio-helpers"
import { CompareRequirementsBox } from "../../../domains/permit-application/compare-requirements-box"
import { ErrorsBox } from "../../../domains/permit-application/errors-box"
import { BuilderBottomFloatingButtons } from "../../../domains/requirement-template/builder-bottom-floating-buttons"
import { CustomMessageBox } from "../../base/custom-message-box"
import { SharedSpinner } from "../../base/shared-spinner"
import { Form, defaultOptions } from "../../chefs"
import { ContactModal } from "../../contact/contact-modal"
import { PreviousSubmissionModal } from "../../revisions/previous-submission-modal"
import { PermitApplicationSubmitModal } from "../permit-application-submit-modal"
import { StepCodeSelectModal } from "../step-code-select-modal"
import { useBlockScrollSpy } from "./hooks/use-block-scroll-spy"
import { useChecklistVisibility } from "./hooks/use-checklist-visibility"
import { useRequirementFormEvents } from "./hooks/use-requirement-form-events"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
  onCompletedBlocksChange?: (sections: any) => void
  formRef: any
  triggerSave?: (params?: { autosave?: boolean; skipPristineCheck?: boolean }) => Promise<boolean | void> | void
  showHelpButton?: boolean
  renderSaveButton?: () => JSX.Element
  isEditing?: boolean
  readOnly?: boolean
  renderTopButtons?: () => React.ReactNode
  updateCollaborationAssignmentNodes?: () => void
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
    readOnly: readOnlyProp = false,
    updateCollaborationAssignmentNodes,
  }: IRequirementFormProps) => {
    const {
      jurisdiction,
      submissionData,
      setSelectedTabIndex,
      selectedTabIndex,
      formJson,
      blockClasses,
      formattedFormJson,
      isDraft,
      previousSubmissionVersion,
      selectedSubmissionVersion,
      previousToSelectedSubmissionVersion,
      isViewingPastRequests,
      inboxEnabled,
      sandbox,
      isStepCodeComplete,
    } = permitApplication

    const {
      visibilityVersion,
      syncCompletedBlocksFromForm,
      syncCompletedBlocksFromFormRef,
      previousBlockLayoutsRef,
      captureBlockLayouts,
    } = useChecklistVisibility({
      formRef,
      blockClasses,
      selectedTabIndex,
      setSelectedTabIndex,
      isStepCodeComplete,
      onCompletedBlocksChange,
    })

    const shouldShowDiff = permitApplication?.shouldShowApplicationDiff(isEditing)
    const userShouldSeeDiff = permitApplication?.currentUserShouldSeeApplicationDiff

    const pastVersion = previousToSelectedSubmissionVersion || previousSubmissionVersion
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const boxRef = useRef<HTMLDivElement>(null)

    useBlockScrollSpy({
      boxRef,
      formJson,
      blockClasses,
      visibilityVersion,
      setSelectedTabIndex,
      previousBlockLayoutsRef,
      captureBlockLayouts,
    })

    const [errorBoxData, setErrorBoxData] = useState<IErrorsBoxData[]>([]) // an array of Labels and links to the component
    const [imminentSubmission, setImminentSubmission] = useState(null)
    const [floatErrorBox, setFloatErrorBox] = useState(false)
    const [hasErrors, setHasErrors] = useState(false)
    const [firstComponentKey, setFirstComponentKey] = useState(null)
    const [isCollapsedAll, setIsCollapsedAllState] = useState(false)

    const currentSubmissionData = useMemo(() => {
      return R.clone(submissionData)
    }, [submissionData])

    const pastClonedDataCache = useRef(new Map())

    const displayedSubmissionData = useMemo(() => {
      if (selectedSubmissionVersion && isViewingPastRequests) {
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
    }, [selectedSubmissionVersion, isViewingPastRequests, currentSubmissionData])

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

    const {
      autofillContactKey,
      previousSubmissionKey,
      isStepCodeSelectOpen,
      setIsStepCodeSelectOpen,
      stepCodeSelectType,
      handleSelectExistingStepCode,
    } = useRequirementFormEvents({
      permitApplication,
      triggerSave,
      onContactsOpen,
      onPreviousSubmissionOpen,
    })

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

    const onScroll = (_event) => {
      setFloatErrorBox(hasErrors && isFirstComponentNearTopOfView(firstComponentKey))
    }

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

    const onFormSubmit = async (submission: any) => {
      // Form.io does not validate the digital Step Code tool (button container, input:false).
      if (getEnergyStepCodeMethodFromData(submission?.data) === "tool" && !isStepCodeComplete) {
        setHasErrors(true)
        setErrorBoxData([
          {
            label: t("permitApplication.edit.stepCodeToolIncomplete"),
            id: "energy-step-code-tool",
            class: "",
          },
        ])
        return
      }
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
      syncCompletedBlocksFromForm(containerComponent.root)
    }

    const onChange = (changedEvent) => {
      const instance = changedEvent?.changed?.instance
      const component = changedEvent?.changed?.component
      const root = instance?.root

      if (!root || !component) {
        return // Exit if necessary objects are not available
      }

      // Visibility/completion for all field types (incl. block conditionals) is synced in formReady's change listener.
      if (component.type === "simplefile") {
        // https://github.com/formio/formio.js/blob/4.19.x/src/components/file/File.unit.js
        // formio `pristine` is not set for file updates
        // using `setPristine(false)` causes the entire form to validate so instead, we use a separate dirty state
        // trigger save to rerun compliance and save file
        triggerSave?.({ autosave: true, skipPristineCheck: true })
      }
    }

    const onInitialized = (_event) => {
      if (!formRef.current) return

      updateCollaborationAssignmentNodes?.()
      syncCompletedBlocksFromForm(formRef.current)
    }

    const formReady = (rootComponent) => {
      formRef.current = rootComponent

      rootComponent.on("change", (_) => {
        // whenever a form data changes, we update the state of ErrorBox with the new error information
        setErrorBoxData(mapErrorBoxData(formRef.current.errors))
        // Keep CONTENTS sidebar in sync with Form.io conditionals (any field type can toggle a block).
        syncCompletedBlocksFromFormRef.current(formRef.current)
      })

      rootComponent.on("submitError", (_error) => {
        // when the form attempts to submit but has validation errors, we set a flag to show ErrorBox
        setHasErrors(true)
        setErrorBoxData(mapErrorBoxData(formRef.current.errors))
      })

      const firstComponent = rootComponent.form.components[0]
      setFirstComponentKey(firstComponent.key)
    }

    let permitAppOptions = {
      ...defaultOptions,
      ...(readOnlyProp ? { readOnly: true } : isDraft ? { readOnly: shouldShowDiff } : { readOnly: false }),
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
    const previousSubmissionRequirement =
      isPreviousSubmissionOpen && previousSubmissionKey && pastVersion?.formJson
        ? getRequirementByKey(pastVersion.formJson, previousSubmissionKey)
        : null
    return (
      <>
        <Flex
          direction="column"
          as={"section"}
          flex={1}
          className={`form-wrapper ${floatErrorBox ? "float-on" : "float-off"}`}
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
          {permitApplication?.isEphemeral && (
            <CustomMessageBox
              title={t("templateVersionPreview.earlyAccessTitle")}
              description={t("templateVersionPreview.earlyAccessDescription")}
              status={EFlashMessageStatus.warning}
            />
          )}
          {!inboxEnabled && !sandbox && (
            <CustomMessageBox
              title={t("permitApplication.show.inboxDisabledTitle")}
              description={t("permitApplication.show.inboxDisabled")}
              status={EFlashMessageStatus.error}
            />
          )}
          {permitApplication.templateVersionDisabledByJurisdiction && !sandbox && (
            <CustomMessageBox
              title={t("permitApplication.show.templateDisabledByJurisdictionTitle")}
              description={t("permitApplication.show.templateDisabledByJurisdiction")}
              status={EFlashMessageStatus.error}
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
          ) : !readOnlyProp ? (
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
          ) : null}
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
          attachedStepCode={permitApplication.stepCode}
          onSelect={handleSelectExistingStepCode}
        />

        {previousSubmissionRequirement && (
          <PreviousSubmissionModal
            isOpen={isPreviousSubmissionOpen}
            onOpen={onPreviousSubmissionOpen}
            onClose={onPreviousSubmissionClose}
            requirementJson={singleRequirementFormJson(previousSubmissionRequirement)}
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
