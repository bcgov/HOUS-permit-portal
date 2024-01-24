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
import { IRequirementBlockParams } from "../../../../types/api-request"
import { BlockSetup } from "./block-setup"
import { FieldsSetup } from "./fields-setup"

export interface IRequirementBlockForm extends IRequirementBlockParams {}

export const RequirementsBlockModal = observer(function RequirementsBlockModal() {
  const { requirementBlockStore } = useMst()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  const getDefaultValues = () => {
    return {
      associationList: [],
      requirementsAttributes: [],
    }
  }
  const formProps = useForm<IRequirementBlockForm>({
    defaultValues: getDefaultValues(),
  })
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
    reset,
  } = formProps

  const onSubmit = async (data: IRequirementBlockForm) => {
    const isSuccess = await requirementBlockStore.createRequirementBlock(data)

    isSuccess && onClose()
  }

  const handleClose = () => {
    //  reset the entire form state
    reset(getDefaultValues())
    onClose()
  }
  return (
    <>
      <Button variant={"primary"} onClick={onOpen}>
        <Text as={"span"} textOverflow={"ellipsis"} overflow={"hidden"} whiteSpace={"nowrap"}>
          {t("requirementsLibrary.modals.create.triggerButton")}
        </Text>
      </Button>

      {/*this is so that the modal children unmount on close to reset their states*/}
      {isOpen && (
        <Modal onClose={handleClose} isOpen>
          <ModalOverlay />
          <FormProvider {...formProps}>
            <ModalContent
              as={"form"}
              onSubmit={handleSubmit(onSubmit)}
              w={"min(1170px, calc(95%))"}
              maxW={"full"}
              py={9}
            >
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
                    {t("ui.onlySave")}
                  </Button>
                  <Button variant={"secondary"} onClick={handleClose}>
                    {t("ui.cancel")}
                  </Button>
                </HStack>
              </ModalHeader>
              <ModalBody px={"2.75rem"}>
                <HStack spacing={9} w={"full"} h={"full"} alignItems={"flex-start"}>
                  <BlockSetup />
                  <FieldsSetup />
                </HStack>
              </ModalBody>
            </ModalContent>
          </FormProvider>
        </Modal>
      )}
    </>
  )
})
