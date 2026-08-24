import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface IInfoDocumentIntroModalProps {
  isOpen: boolean
  onClose: () => void
  introText: string
  onSubmit: (introText: string) => Promise<boolean>
}

export const InfoDocumentIntroModal = ({ isOpen, onClose, introText, onSubmit }: IInfoDocumentIntroModalProps) => {
  const { t } = useTranslation()
  const translate = t as any
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<{ introText: string }>({
    defaultValues: { introText: "" },
  })

  useEffect(() => {
    if (!isOpen) return
    reset({ introText })
  }, [introText, isOpen, reset])

  const submit = handleSubmit(async (data) => {
    const success = await onSubmit(data.introText.trim())
    if (success) onClose()
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent
        as="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit(event)
        }}
      >
        <ModalHeader>{translate("infoDocuments.management.introEditTitle")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>{translate("infoDocuments.management.introTitle")}</FormLabel>
            <Textarea rows={5} {...register("introText")} />
            <FormHelperText>{translate("infoDocuments.management.introHelp")}</FormHelperText>
          </FormControl>
        </ModalBody>
        <ModalFooter gap={4} justifyContent="flex-start">
          <Button variant="secondary" type="button" onClick={onClose} isDisabled={isSubmitting}>
            {translate("ui.cancel")}
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {translate("ui.save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
