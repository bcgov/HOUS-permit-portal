import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { BlockSetup } from "./block-setup"

export interface IRequirementBlockForm {
  name: string
  description?: string
  associationList: string[]
}

export const RequirementsBlockModal = observer(function RequirementsBlockModal() {
  const { requirementBlockStore } = useMst()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  const formProps = useForm<IRequirementBlockForm>({ defaultValues: { associationList: [] } })
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = formProps

  const onSubmit = async (data: IRequirementBlockForm) => {
    const isSuccess = await requirementBlockStore.createRequirementBlock(data)

    isSuccess && onClose()
  }

  return (
    <>
      <Button variant={"primary"} onClick={onOpen}>
        <Text as={"span"} textOverflow={"ellipsis"} overflow={"hidden"} whiteSpace={"nowrap"}>
          {t("requirementsLibrary.modals.create.triggerButton")}
        </Text>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <FormProvider {...formProps}>
          <ModalContent as={"form"} onSubmit={handleSubmit(onSubmit)} w={"min(1170px, calc(95%))"} maxW={"full"} py={9}>
            <ModalCloseButton fontSize={"11px"} />
            <ModalHeader display={"flex"} justifyContent={"space-between"} p={0} px={"2.75rem"}>
              <Text as={"h2"} fontSize={"2xl"}>
                {t("requirementsLibrary.modals.create.title")}
              </Text>
              <HStack>
                <Button
                  variant={"primary"}
                  type={"submit"}
                  isDisabled={isSubmitting || !isValid}
                  isLoading={isSubmitting}
                >
                  {t("ui.save")}
                </Button>
                <Button variant={"secondary"} onClick={onClose}>
                  {t("ui.cancel")}
                </Button>
              </HStack>
            </ModalHeader>
            <ModalBody px={"2.75rem"}>
              <HStack spacing={9} w={"full"} h={"full"}>
                <BlockSetup />
              </HStack>
            </ModalBody>
          </ModalContent>
        </FormProvider>
      </Modal>
    </>
  )
})
