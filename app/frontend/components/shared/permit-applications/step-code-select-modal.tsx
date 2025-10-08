import {
  Button,
  Flex,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("stepCode.index.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap={4} w="full">
            <FormControl w="full">
              <ModelSearchInput
                searchModel={stepCodeStore}
                inputProps={{ placeholder: t("ui.search"), width: "full" }}
                inputGroupProps={{ width: "full" }}
              />
            </FormControl>
            <StepCodesSelectGrid onSelect={onSelect} />

            <Flex justify="flex-end" gap={2} mt={4}>
              <Button onClick={onClose}>{t("ui.close")}</Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
})
