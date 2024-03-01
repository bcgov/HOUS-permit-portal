import { Box, Button, Flex, HStack, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
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
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"
import { ChecklistSideBar } from "./checklist-sidebar"
import { ContactSummaryModal } from "./contact-summary-modal"

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

  const { register, watch, setValue, handleSubmit, reset } = useForm<TPermitApplicationMetadataForm>({
    mode: "onChange",
    defaultValues: getDefaultPermitApplicationMetadataValues(),
  })

  const nicknameWatch = watch("nickname")
  const isStepCode = R.test(/step-code/, window.location.pathname)

  const [completedSections, setCompletedSections] = useState({})

  const handleSave = async () => {
    if (currentPermitApplication.isSubmitted || isStepCode) return

    const formio = formRef.current
    const submissionData = formio.data
    try {
      const response = await currentPermitApplication.update({
        submissionData: { data: submissionData },
        nickname: nicknameWatch,
      })
      if (response.ok && response.data.data.frontEndFormUpdate) {
        for (const [key, value] of Object.entries(response.data.data.frontEndFormUpdate)) {
          let componentToSet = formio.getComponent(key)
          componentToSet.setValue(value)
        }
        //update file hashes that have been changed
      }
    } catch (e) {}
  }

  const handleClickFinishLater = async () => {
    await handleSave()
    navigate("/")
  }

  const handleDownloadApplication = () => {
    // TODO: APPLICATION DOWNLOAD
  }

  // const onSubmitMetadata = (formValues) => {
  //   currentPermitApplication.update(formValues)
  // }

  useInterval(handleSave, 60000) // save progress every minute

  useEffect(() => {
    // sets the defaults subject to application load
    reset(getDefaultPermitApplicationMetadataValues())
  }, [currentPermitApplication?.nickname])

  const { isOpen, onOpen, onClose } = useDisclosure()

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication) return <LoadingScreen />

  const scrollToBottom = () => {
    handleScrollToBottom("permitApplicationFieldsContainer")
  }

  const { permitTypeAndActivity, formJson, number, isSubmitted } = currentPermitApplication

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
            <Text mt={1}>
              {t("permitApplication.fields.number")}:{" "}
              <Text as="span" fontWeight={700}>
                {number}
              </Text>
            </Text>
          </Flex>
        </HStack>
        {isSubmitted ? (
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
      </Flex>
      <Flex w="full" h="calc(100% - 96px)" overflow="auto" id="permitApplicationFieldsContainer">
        <ChecklistSideBar permitApplication={currentPermitApplication} completedSections={completedSections} />
        {formJson && (
          <Flex flex={1} direction="column" p={24}>
            <RequirementForm
              formRef={formRef}
              permitApplication={currentPermitApplication}
              onCompletedSectionsChange={setCompletedSections}
              triggerSave={handleSave}
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
