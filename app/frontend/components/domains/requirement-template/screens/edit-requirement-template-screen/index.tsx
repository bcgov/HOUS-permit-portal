import {
  Box,
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useMst } from "../../../../../setup/root"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { DatePicker } from "../../../../shared/date-picker"
import {
  BaseEditRequirementTemplateScreen,
  IEditRequirementActionsProps,
} from "../base-edit-requirement-template-screen"

export interface IEditRequirementTemplateScreenRenderActionProps extends Partial<IEditRequirementActionsProps> {}

export const EditRequirementTemplateScreen = observer(function EditRequirementTemplateScreen() {
  return <BaseEditRequirementTemplateScreen renderActions={PublishScheduleModal} />
})

function PublishScheduleModal({
  minDate,
  onScheduleConfirm,
  triggerButtonProps,
  onForcePublishNow,
}: IEditRequirementTemplateScreenRenderActionProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [scheduleDate, setScheduleDate] = React.useState(null)
  const { uiStore } = useMst()

  const onSchedule = () => {
    onScheduleConfirm(scheduleDate)
    onClose()
  }

  const onCancel = () => {
    onClose()
    uiStore.flashMessage.show(EFlashMessageStatus.warning, t("requirementTemplate.edit.scheduleModalCancelMessage"), "")
  }

  useEffect(() => {
    !isOpen && setScheduleDate(null)
  }, [isOpen])

  return (
    <>
      <Button variant={"primary"} rightIcon={<CaretRight />} onClick={onOpen} {...triggerButtonProps}>
        {t("ui.publish")}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
        <ModalOverlay />
        <ModalContent w={onForcePublishNow ? "container.sm" : "436px"}>
          <ModalHeader fontSize={"2xl"} mt={2}>
            {t("requirementTemplate.edit.scheduleModalTitle")}
          </ModalHeader>
          <ModalBody>
            <Text>{t("requirementTemplate.edit.scheduleModalBody")}</Text>
            <Stack spacing={1} mt={6}>
              <Text>
                <Trans
                  i18nKey="requirementTemplate.edit.scheduleModalHelperText"
                  components={{
                    1: <Text as="span" color="semantic.error" fontWeight="bold" />,
                  }}
                />
              </Text>

              <Box>
                <DatePicker selected={scheduleDate} onChange={setScheduleDate} minDate={minDate} />
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter justifyContent={"flex-start"} mt={4}>
            <ButtonGroup spacing={4}>
              <Button variant={"primary"} isDisabled={!scheduleDate} onClick={onSchedule}>
                {t("ui.confirm")}
              </Button>
              <Button variant={"secondary"} onClick={onCancel}>
                {t("ui.neverMind")}
              </Button>
              {onForcePublishNow && (
                <Button variant={"secondary"} color={"error"} borderColor={"error"} onClick={onForcePublishNow}>
                  {t("requirementTemplate.edit.forcePublishNow")}
                </Button>
              )}
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
