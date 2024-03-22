import { Box, Button, Flex, HStack, Stack, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import { CaretRight, Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { useInterval } from "../../../hooks/use-interval"
import { handleScrollToBottom } from "../../../utils/utility-functions"
import { BuilderTopFloatingButtons } from "../../domains/requirement-template/builder-top-floating-buttons"
import { CopyableValue } from "../../shared/base/copyable-value"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
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

  const handlePermitApplicationUpdate = (_event: CustomEvent) => {
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
    document.addEventListener("handlePermitApplicationUpdate", handlePermitApplicationUpdate)
    return () => {
      document.removeEventListener("handlePermitApplicationUpdate", handlePermitApplicationUpdate)
    }
  })

  const nicknameWatch = watch("nickname")
  const isStepCode = R.test(/step-code/, window.location.pathname)

  const handleSave = async () => {
    if (currentPermitApplication.isSubmitted || isStepCode || isContactsOpen) return

    const formio = formRef.current
    const submissionData = formio.data
    try {
      const response = await currentPermitApplication.update({
        submissionData: { data: submissionData },
        nickname: nicknameWatch,
      })
      if (response.ok && response.data.data.frontEndFormUpdate) {
        updateFormIoValues(formio, response.data.data.frontEndFormUpdate)
        //update file hashes that have been changed
      }
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
      if (!R.isNil(value)) {
        let componentToSet = formio.getComponent(key)
        if (!R.isNil(componentToSet)) {
          componentSetValue(componentToSet, value)
        }
      }
    }
  }

  //guard happens before this call to optimize code
  const componentSetValue = (componentToSet, newValue) => {
    if (componentToSet?.component?.type == "file") {
      //all file types use S3, always set to what is returned.  No values would ever be set via the formUpdateChange, ignore any values
    } else {
      //if it is a computed compliance
      if (componentToSet?.getValue && (componentToSet.getValue() == "" || R.isNil(componentToSet.getValue()))) {
        import.meta.env.DEV && console.log("[DEV] setting computed compliance value", componentToSet, newValue)
        componentToSet.setValue(newValue)
      }
    }
  }

  const handleClickFinishLater = async () => {
    const success = await handleSave()
    if (success) {
      navigate("/")
    }
  }

  useInterval(handleSave, 60000) // save progress every minute

  useEffect(() => {
    // sets the defaults subject to application load
    reset(getDefaultPermitApplicationMetadataValues())
  }, [currentPermitApplication?.nickname])

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication?.isFullyLoaded) return <LoadingScreen />

  const scrollToBottom = () => {
    handleScrollToBottom("permitApplicationFieldsContainer")
  }

  const { permitTypeAndActivity, formJson, number, isSubmitted } = currentPermitApplication

  return (
    <Box as="main" id="submitter-view-permit">
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
        zIndex="11"
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
                      onBlur: handleSave,
                      "aria-label": "Edit Nickname",
                    }}
                    editablePreviewProps={{
                      fontWeight: 700,
                      fontSize: "xl",
                    }}
                    aria-label={"Edit Nickname"}
                    onCancel={(previousValue) => setValue("nickname", previousValue)}
                  />
                </Box>
              </Tooltip>
            </form>

            <Text>{permitTypeAndActivity}</Text>
            <CopyableValue value={number} label={t("permitApplication.fields.number")} />
          </Flex>
        </HStack>
        {isSubmitted ? (
          <Stack direction={{ base: "column", lg: "row" }} align={{ base: "flex-end", lg: "center" }}>
            <Button variant="ghost" leftIcon={<Info size={20} />} color="white" onClick={onContactsOpen}>
              {t("permitApplication.show.contactsSummary")}
            </Button>
            <SubmissionDownloadModal permitApplication={currentPermitApplication} />
            <Button rightIcon={<CaretRight />} onClick={() => navigate("/")}>
              {t("ui.backHome")}
            </Button>
          </Stack>
        ) : (
          <HStack gap={4}>
            <Button variant="primary" onClick={handleClickFinishLater}>
              {t("permitApplication.edit.saveDraft")}
            </Button>
            <Button rightIcon={<CaretRight />} onClick={scrollToBottom}>
              {t("permitApplication.edit.submit")}
            </Button>
          </HStack>
        )}
        <BuilderTopFloatingButtons top="155px" />
      </Flex>
      <Flex id="permitApplicationFieldsContainer">
        <ChecklistSideBar permitApplication={currentPermitApplication} completedBlocks={completedBlocks} />
        {formJson && (
          <Flex flex={1} direction="column" p={8} position={"relative"}>
            <RequirementForm
              formRef={formRef}
              permitApplication={currentPermitApplication}
              onCompletedBlocksChange={setCompletedBlocks}
              triggerSave={handleSave}
              showHelpButton
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
