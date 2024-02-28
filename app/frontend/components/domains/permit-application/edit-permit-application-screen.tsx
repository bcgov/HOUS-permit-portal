import { Box, Button, Flex, HStack, Text, Tooltip } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { useInterval } from "../../../hooks/use-interval"
import { handleScrollToBottom } from "../../../utils/utility-funcitons"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { PermitApplicationStatusTag } from "../../shared/permit-applications/permit-application-status-tag"
import { RequirementForm } from "../../shared/permit-applications/requirement-form"
import { ChecklistSideBar } from "./checklist-sidebar"

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

  const [completedSections, setCompletedSections] = useState({})

  const handleSave = async () => {
    const formio = formRef.current
    const submissionData = formio.data
    try {
      const response = await currentPermitApplication.update({ submissionData: { data: submissionData } })
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

  const onSubmitMetadata = (formValues) => {
    currentPermitApplication.update(formValues)
  }

  useInterval(handleSave, 60000) // save progress every minute

  useEffect(() => {
    // sets the defaults subject to application load
    reset(getDefaultPermitApplicationMetadataValues())
  }, [currentPermitApplication?.nickname])

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitApplication) return <LoadingScreen />

  const { permitTypeAndActivity, formJson, number } = currentPermitApplication

  return (
    <>
      <Flex
        w="full"
        p={6}
        bg="theme.blue"
        justify="space-between"
        color="greys.white"
        position="sticky"
        top={0}
        zIndex={10}
        py={3}
        maxH="112px"
      >
        <HStack gap={4} flex={1}>
          <PermitApplicationStatusTag permitApplication={currentPermitApplication} />
          <Flex direction="column" w="full">
            <form onSubmit={handleSubmit(onSubmitMetadata)}>
              <Tooltip label={t("permitApplication.edit.clickToWriteNickname")} placement="top-start">
                <Box>
                  <EditableInputWithControls
                    w="full"
                    initialHint={t("permitApplication.edit.clickToWriteNickname")}
                    value={nicknameWatch || ""}
                    controlsProps={{
                      iconButtonProps: {
                        color: "greys.white",
                      },
                      saveButtonProps: { display: "none" },
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
                      onBlur: handleSubmit(onSubmitMetadata),
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
        <HStack gap={4}>
          <Button variant="primary" onClick={handleClickFinishLater}>
            {t("permitApplication.edit.saveDraft")}
          </Button>
          <Button rightIcon={<CaretRight />} onClick={handleScrollToBottom}>
            {t("permitApplication.edit.submit")}
          </Button>
        </HStack>
      </Flex>
      <Flex as="main" direction="column" w="full" bg="greys.white" key={"permit-application-show"}>
        <Box w="full">
          <ChecklistSideBar permitApplication={currentPermitApplication} completedSections={completedSections} />
          {formJson && (
            <Flex direction="column" pl={24} py={24} pr={288}>
              <RequirementForm
                formRef={formRef}
                permitApplication={currentPermitApplication}
                onCompletedSectionsChange={setCompletedSections}
              />
            </Flex>
          )}
        </Box>
      </Flex>
    </>
  )
})
