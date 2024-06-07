import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react"
import React from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IPermitApplication, reasonCodes } from "../../../models/permit-application"
import { IFormIORequirement } from "../../../types/types"

export interface IRevisionModalProps extends Partial<ReturnType<typeof useDisclosure>> {
  permitApplication?: IPermitApplication
  requirementJson: IFormIORequirement
}

export const RevisionModal: React.FC<IRevisionModalProps> = ({
  permitApplication,
  requirementJson,
  isOpen,
  onOpen,
  onClose,
}) => {
  const { t } = useTranslation()

  interface IRequestRevisionFormData {
    comment?: string
    reasonCode: string
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IRequestRevisionFormData>()

  const onSubmit = (formData: IRequestRevisionFormData) => {
    permitApplication.stageRevisionRequest({
      ...formData,
      requirementJson,
    })

    const className = `formio-component-${requirementJson.key}`
    const elements = document.getElementsByClassName(className)
    if (elements.length > 0) {
      elements[0].classList.add("revision-requested")
    }

    onClose()
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="sm">
      <ModalOverlay />

      <ModalContent mt={48}>
        <ModalHeader textAlign="center">
          <ModalCloseButton fontSize="11px" />
          <Heading as="h3" fontSize="xl">
            {t("permitApplication.show.revision.requestRevision")}
          </Heading>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap={4}>
              <FormControl>
                <FormLabel>{t("permitApplication.show.revision.reasonFor")}</FormLabel>
                <Select placeholder={t("ui.pleaseSelect")} {...register("reasonCode", { required: true })}>
                  {reasonCodes.map((code) => (
                    <option value={code} key={code}>
                      {/* @ts-ignore */}
                      {t(`permitApplication.show.revision.reasons.${code}`)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t("permitApplication.show.revision.comment")}</FormLabel>
                <Textarea
                  {...register("comment", {
                    required: false,
                    maxLength: {
                      value: 350,
                      message: t("permitApplication.show.revision.maxCharacters"),
                    },
                  })}
                />
                <FormHelperText>{t("permitApplication.show.revision.maxCharacters")}</FormHelperText>
              </FormControl>
            </Flex>
            <ModalFooter>
              <Flex width="full" justify="center" gap={4}>
                <Button type="submit" variant="primary" isDisabled={!isValid}>
                  {t("permitApplication.show.revision.useButton")}
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  {t("ui.cancel")}
                </Button>
              </Flex>
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
