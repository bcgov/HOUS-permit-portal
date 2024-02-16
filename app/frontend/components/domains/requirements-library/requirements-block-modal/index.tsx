import {
  Button,
  ButtonProps,
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
import { resetForm } from "@formio/react"
import { Warning } from "@phosphor-icons/react"
import { autorun } from "mobx"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementBlock } from "../../../../models/requirement-block"
import { useMst } from "../../../../setup/root"
import { IRequirementBlockParams } from "../../../../types/api-request"
import { BlockSetup } from "./block-setup"
import { FieldsSetup } from "./fields-setup"

export interface IRequirementBlockForm extends IRequirementBlockParams {
  sku?: string
}

interface IRequirementsBlockProps {
  requirementBlock?: IRequirementBlock
  showEditWarning?: boolean
  triggerButtonProps?: Partial<ButtonProps>
}

export const RequirementsBlockModal = observer(function RequirementsBlockModal({
  requirementBlock,
  showEditWarning,
  triggerButtonProps,
}: IRequirementsBlockProps) {
  const { requirementBlockStore } = useMst()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  const getDefaultValues = (): Partial<IRequirementBlockForm> => {
    return requirementBlock
      ? {
          name: requirementBlock.name,
          description: requirementBlock.description,
          displayName: requirementBlock.displayName,
          displayDescription: requirementBlock.displayDescription,
          sku: requirementBlock.sku,
          associationList: requirementBlock.associations,
          requirementsAttributes: requirementBlock.requirements,
        }
      : {
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
    let isSuccess = false

    if (requirementBlock) {
      const removedRequirementAttributes = requirementBlock.requirements
        .filter((requirement) => !data.requirementsAttributes.find((attribute) => attribute.id === requirement.id))
        .map((requirement) => ({ id: requirement.id, _destroy: true }))

      isSuccess = await requirementBlock.update({
        ...data,
        requirementsAttributes: [...data.requirementsAttributes, ...removedRequirementAttributes],
      })
    } else {
      isSuccess = await requirementBlockStore.createRequirementBlock(data)
    }

    isSuccess && onClose()
  }

  const handleClose = () => {
    //  reset the entire form state
    reset(getDefaultValues())
    onClose()
  }

  useEffect(
    autorun(() => {
      if (isOpen) {
        resetForm(getDefaultValues())
      }
    }),
    [isOpen]
  )

  return (
    <>
      <Button
        variant={requirementBlock ? "link" : "primary"}
        textDecoration={requirementBlock ? "underline" : undefined}
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
        {...triggerButtonProps}
      >
        <Text as={"span"} textOverflow={"ellipsis"} overflow={"hidden"} whiteSpace={"nowrap"}>
          {requirementBlock ? t("ui.edit") : t("requirementsLibrary.modals.create.triggerButton")}
        </Text>
      </Button>

      {/*this is so that the modal children unmount on close to reset their states*/}
      {isOpen && (
        <Modal onClose={handleClose} isOpen>
          <ModalOverlay />
          <FormProvider {...formProps}>
            <ModalContent as={"form"} w={"min(1170px, 95%)"} maxW={"full"} py={9}>
              <ModalCloseButton fontSize={"11px"} />
              <ModalHeader display={"flex"} justifyContent={"space-between"} p={0} px={"2.75rem"}>
                <Text as={"h2"} fontSize={"2xl"}>
                  {t(`requirementsLibrary.modals.${requirementBlock ? "edit" : "create"}.title`)}
                </Text>
                <HStack>
                  <Button
                    variant={"primary"}
                    isDisabled={isSubmitting || !isValid}
                    isLoading={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {t("ui.onlySave")}
                  </Button>
                  <Button variant={"secondary"} onClick={handleClose} isDisabled={isSubmitting}>
                    {t("ui.cancel")}
                  </Button>
                </HStack>
              </ModalHeader>
              <ModalBody px={"2.75rem"}>
                {showEditWarning && (
                  <HStack
                    spacing={2}
                    w={"full"}
                    my={8}
                    p={4}
                    border={"1px solid"}
                    borderColor={"semantic.warning"}
                    bg={"semantic.warningLight"}
                    borderRadius={"lg"}
                  >
                    <Warning aria-label={"Warning icon"} />
                    <Text>{t("requirementsLibrary.modals.editWarning")}</Text>
                  </HStack>
                )}
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
