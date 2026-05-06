import { Button, ButtonGroup, Dialog, Portal, useDisclosure } from "@chakra-ui/react"
import { ArrowCounterClockwise } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"

export const RestartConfirmationModal = observer(function RestartStepCodeConfirmationModal() {
  const { open, onOpen, onClose } = useDisclosure()
  const { stepCodeStore } = useMst()
  const navigate = useNavigate()

  const handleDeleteStepCode = async () => {
    const permitApplicationId = stepCodeStore.currentStepCode?.permitApplicationId
    const response = await stepCodeStore.deleteStepCode()
    if (response?.ok) {
      const targetPath = permitApplicationId
        ? `/permit-applications/${permitApplicationId}/edit/part-9-step-code`
        : "/part-9-step-code/new"
      navigate(targetPath, { replace: true })
    }
    onClose()
  }

  return (
    <>
      <Button variant="tertiary" onClick={onOpen}>
        {t("stepCode.restart.trigger")}
        <ArrowCounterClockwise />
      </Button>
      <Dialog.Root
        open={open}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header fontSize={"2xl"} mt={2}>
                {t("stepCode.restart.confirm.title")}
              </Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body>{t("stepCode.restart.confirm.body")}</Dialog.Body>
              <Dialog.Footer justifyContent={"flex-start"}>
                <ButtonGroup gap={4}>
                  <Button variant={"primary"} onClick={handleDeleteStepCode}>
                    <ArrowCounterClockwise />
                    {t("stepCode.restart.trigger")}
                  </Button>
                  <Button variant={"secondary"} onClick={onClose}>
                    {t("ui.neverMind")}
                  </Button>
                </ButtonGroup>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
})
