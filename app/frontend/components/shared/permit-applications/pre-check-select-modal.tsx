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
import { PreChecksSelectGrid } from "../../domains/permit-project/pre-checks-select-grid"
import { ModelSearchInput } from "../base/model-search-input"

interface IProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (preCheckId: string) => Promise<void>
}

export const PreCheckSelectModal = observer(function PreCheckSelectModal({ isOpen, onClose, onSelect }: IProps) {
  const { t } = useTranslation()
  const { preCheckStore } = useMst()

  useEffect(() => {
    if (!isOpen) return
    preCheckStore.searchPreChecks({ reset: true })
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("preCheck.index.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap={4} w="full">
            <FormControl w="full">
              <ModelSearchInput
                searchModel={preCheckStore}
                inputProps={{ placeholder: t("ui.search"), width: "full" }}
                inputGroupProps={{ width: "full" }}
              />
            </FormControl>
            <PreChecksSelectGrid onSelect={onSelect} />

            <Flex justify="flex-end" gap={2} mt={4}>
              <Button onClick={onClose}>{t("ui.close")}</Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
})
