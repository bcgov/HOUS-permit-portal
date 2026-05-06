import { Button, Dialog, Field, Flex, Portal } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EStepCodeType } from "../../../types/enums"
import { StepCodesSelectGrid } from "../../domains/permit-project/step-codes-select-grid"
import { ModelSearchInput } from "../base/model-search-input"

interface IProps {
  isOpen: boolean
  onClose: () => void
  stepCodeType: EStepCodeType
  onSelect: (stepCodeId: string) => Promise<void>
}

export const StepCodeSelectModal = observer(function StepCodeSelectModal({
  isOpen,
  onClose,
  stepCodeType,
  onSelect,
}: IProps) {
  const { t } = useTranslation()
  const { stepCodeStore } = useMst()

  useEffect(() => {
    if (!isOpen) return
    const typeFilter =
      stepCodeType === EStepCodeType.part3StepCode ? [EStepCodeType.part3StepCode] : [EStepCodeType.part9StepCode]
    stepCodeStore.setTypeFilter(typeFilter as any)
    stepCodeStore.searchStepCodes({ reset: true })
  }, [isOpen, stepCodeType])

  return (
    <Dialog.Root
      open={open}
      size="xl"
      placement="center"
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
            <Dialog.Header>{t("stepCode.index.title")}</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Flex direction="column" gap={4} w="full">
                <Field.Root w="full">
                  <ModelSearchInput
                    searchModel={stepCodeStore}
                    inputProps={{ placeholder: t("ui.search"), width: "full" }}
                    inputGroupProps={{ width: "full" }}
                  />
                </Field.Root>
                <StepCodesSelectGrid onSelect={onSelect} />

                <Flex justify="flex-end" gap={2} mt={4}>
                  <Button onClick={onClose}>{t("ui.close")}</Button>
                </Flex>
              </Flex>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
})
