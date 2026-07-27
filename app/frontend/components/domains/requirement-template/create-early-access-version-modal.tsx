import {
  Button,
  ButtonProps,
  Center,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IRequirementTemplateConfigError } from "../../../types/types"
import { ConfigErrorsList } from "./config-errors-list"

interface ICreateEarlyAccessVersionModalProps {
  onCreateEarlyAccessVersion?: () => Promise<void> | void
  onSaveAndValidate?: () => Promise<IRequirementTemplateConfigError[]>
  requirementTemplateId?: string
  triggerButtonProps?: Partial<ButtonProps>
  renderTrigger?: (onOpen: () => void) => React.ReactNode
}

export const CreateEarlyAccessVersionModal = observer(function CreateEarlyAccessVersionModal({
  onCreateEarlyAccessVersion,
  onSaveAndValidate,
  requirementTemplateId,
  triggerButtonProps,
  renderTrigger,
}: ICreateEarlyAccessVersionModalProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isCreating, setIsCreating] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [configErrors, setConfigErrors] = useState<IRequirementTemplateConfigError[]>([])

  const hasConfigErrors = configErrors.length > 0
  const actionsDisabled = isValidating || hasConfigErrors || isCreating

  useEffect(() => {
    if (!isOpen) {
      setConfigErrors([])
      setIsValidating(false)
      setIsCreating(false)
      return
    }

    if (!onSaveAndValidate) return

    let cancelled = false
    setIsValidating(true)
    setConfigErrors([])
    ;(async () => {
      try {
        const errors = await onSaveAndValidate()
        if (!cancelled) setConfigErrors(errors ?? [])
      } catch {
        if (!cancelled) setConfigErrors([])
      } finally {
        if (!cancelled) setIsValidating(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const onConfirm = async () => {
    setIsCreating(true)
    try {
      await onCreateEarlyAccessVersion?.()
      onClose()
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(onOpen)
      ) : (
        <Button variant="secondary" onClick={onOpen} {...triggerButtonProps}>
          {t("requirementTemplate.edit.createEarlyAccessVersion")}
        </Button>
      )}
      <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
        <ModalOverlay />
        <ModalContent w="full" maxW="436px" mx={4}>
          <ModalHeader fontSize={"2xl"} mt={2}>
            {t("requirementTemplate.edit.earlyAccessModalTitle")}
          </ModalHeader>
          <ModalBody>
            {isValidating ? (
              <Center py={10}>
                <Spinner size="lg" />
              </Center>
            ) : (
              <>
                <Text>{t("requirementTemplate.edit.earlyAccessModalBody")}</Text>
                {requirementTemplateId && (
                  <ConfigErrorsList
                    errors={configErrors}
                    requirementTemplateId={requirementTemplateId}
                    onNavigate={onClose}
                  />
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter justifyContent={"flex-start"} mt={4} gap={3}>
            <Button variant={"primary"} onClick={onConfirm} isLoading={isCreating} isDisabled={actionsDisabled}>
              {t("ui.confirm")}
            </Button>
            <Button variant={"secondary"} onClick={onClose} isDisabled={isCreating || isValidating}>
              {t("ui.neverMind")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})
