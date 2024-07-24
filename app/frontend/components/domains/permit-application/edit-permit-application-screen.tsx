import { Box, Button, Flex, HStack, Stack, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import { CaretRight, FloppyDiskBack, Info } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { requirementTypeToFormioType } from "../../../constants"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { useInterval } from "../../../hooks/use-interval"
import { ICustomEventMap } from "../../../types/dom"
import { ECustomEvents, ERequirementType } from "../../../types/enums"
import { handleScrollToBottom } from "../../../utils/utility-functions"
import { CopyableValue } from "../../shared/base/copyable-value"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { FloatingHelpDrawer } from "../../shared/floating-help-drawer"
import { BrowserSearchPrompt } from "../../shared/permit-applications/browser-search-prompt"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"
import { ChecklistSideBar } from "./checklist-sidebar"
import { ContactSummaryModal } from "./contact-summary-modal"
import { SubmissionDownloadModal } from "./submission-download-modal"

interface IEditPermitApplicationScreenProps {}

type TPermitApplicationMetadataForm = {
  nickname: string
}

export const EditPermitApplicationScreen = observer(({}: IEditPermitApplicationScreenProps) => {
  const { currentPermitApplication, error } = usePermitApplication()
  const { t } = useTranslation()
  const formRef = useRef(null)
  const navigate = useNavigate()

  const getDefaultPermitApplicationMetadataValues = () => ({ nickname: currentPermitApplication?.nickname })

  const { register, watch, setValue, reset } = useForm<TPermitApplicationMetadataForm>({
    mode: "onChange",
    defaultValues: getDefaultPermitApplicationMetadataValues(),
  })

  const [completedBlocks, setCompletedBlocks] = useState({})
  const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()

  const [processEventOnLoad, setProcessEventOnLoad] = useState<CustomEvent | null>(null)

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

  const nicknameWatch = watch("nickname")
  const isStepCode = R.test(/step-code/, window.location.pathname)

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
      const componentToSet = formio.getComponent(key)
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
      navigate("/")
    }
  }

  useInterval(() => handleSave({ autosave: true }), 60000) // save progress every minute

  useEffect(() => {
    // sets the defaults subject to application load
    reset(getDefaultPermitApplicationMetadataValues())
  }, [currentPermitApplication?.nickname])

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication?.isFullyLoaded) return <LoadingScreen />

  const scrollToBottom = () => {
    handleScrollToBottom()
  }

  const { permitTypeAndActivity, formJson, number, isSubmitted, isDirty, setIsDirty } = currentPermitApplication

  return (
    <Box as="main" id="submitter-view-permit">
      {!isStepCode && (
        <Flex
          id="permitHeader"
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
          <HStack gap={4} flex={1}>
            <PermitApplicationStatusTag permitApplication={currentPermitApplication} />
            <Flex direction="column" w="full">
              <form>
                <Tooltip label={t("permitApplication.edit.clickToWriteNickname")} placement="top-start">
                  <Box>
                    <EditableInputWithControls
                      w="full"
                      initialHint={t("permitApplication.edit.clickToWriteNickname")}
                      value={nicknameWatch || ""}
                      isDisabled={isSubmitted}
                      controlsProps={{
                        iconButtonProps: {
                          color: "greys.white",
                          display: isSubmitted ? "none" : "block",
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

                        onBlur: () => {
                          handleSave()
                        },
                        "aria-label": "Edit Nickname",
                      }}
                      editablePreviewProps={{
                        fontWeight: 700,
                        fontSize: "xl",
                      }}
                      onEdit={() => {
                        setIsDirty(true)
                      }}
                      aria-label={"Edit Nickname"}
                      onCancel={(previousValue) => setValue("nickname", previousValue)}
                    />
                  </Box>
                </Tooltip>
              </form>

              <Text noOfLines={1}>{permitTypeAndActivity}</Text>
              <HStack>
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
              </Button>
              <SubmissionDownloadModal permitApplication={currentPermitApplication} />
              <Button rightIcon={<CaretRight />} onClick={() => navigate("/")}>
                {t("permitApplication.show.backToInbox")}
              </Button>
            </Stack>
          ) : (
            <HStack gap={4}>
              <BrowserSearchPrompt />
              <Button variant="primary" onClick={handleClickFinishLater}>
                {t("permitApplication.edit.saveDraft")}
              </Button>
              <Button rightIcon={<CaretRight />} onClick={scrollToBottom}>
                {t("permitApplication.edit.submit")}
              </Button>
            </HStack>
          )}
          <FloatingHelpDrawer top={{ base: "145px", md: "130px" }} position="absolute" />
        </Flex>
      )}
      <Box id="sidebar-and-form-container" sx={{ "&:after": { content: `""`, display: "block", clear: "both" } }}>
        <ChecklistSideBar permitApplication={currentPermitApplication} completedBlocks={completedBlocks} />
        {formJson && (
          <Flex flex={1} direction="column" pt={8} position={"relative"} id="permitApplicationFieldsContainer">
            <RequirementForm
              formRef={formRef}
              permitApplication={currentPermitApplication}
              onCompletedBlocksChange={setCompletedBlocks}
              triggerSave={handleSave}
              showHelpButton
              isEditing
              renderSaveButton={() => <SaveButton handleSave={handleSave} />}
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

function SaveButton({ handleSave }) {
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
        isDisabled={isSubmitting}
      >
        {t("ui.onlySave")}
      </Button>
    </form>
  )
}
