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
import { autorun } from "mobx"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementBlock } from "../../../../models/requirement-block"
import { useMst } from "../../../../setup/root"
import { IRequirementAttributes, IRequirementBlockParams } from "../../../../types/api-request"
import { EEnergyStepCodeDependencyRequirementCode } from "../../../../types/enums"
import { IDenormalizedRequirementBlock } from "../../../../types/types"
import { CalloutBanner } from "../../../shared/base/callout-banner"
import { BlockSetup } from "./block-setup"
import { FieldsSetup } from "./fields-setup"

export interface IRequirementBlockForm extends IRequirementBlockParams {
  sku?: string
}

interface IRequirementsBlockProps {
  requirementBlock?: IRequirementBlock | IDenormalizedRequirementBlock
  showEditWarning?: boolean
  triggerButtonProps?: Partial<ButtonProps>
}

export const RequirementsBlockModal = observer(function RequirementsBlockModal({
  requirementBlock,
  showEditWarning,
  triggerButtonProps,
}: IRequirementsBlockProps) {
  const { requirementBlockStore } = useMst()
  const { t } = useTranslation()
  const { createRequirementBlock } = requirementBlockStore
  const { isOpen, onOpen, onClose } = useDisclosure()

  const getDefaultValues = (): Partial<IRequirementBlockForm> => {
    return requirementBlock
      ? {
          name: requirementBlock.name,
          description: requirementBlock.description,
          displayName: requirementBlock.displayName,
          displayDescription: requirementBlock.displayDescription,
          sku: (requirementBlock as IRequirementBlock).sku,
          associationList: (requirementBlock as IRequirementBlock).associations,
          requirementsAttributes: (requirementBlock as IRequirementBlock).requirementFormDefaults,
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
    formState: { isSubmitting, isValid, errors },
    reset,
  } = formProps

  const onSubmit = async (data: IRequirementBlockForm) => {
    let isSuccess = false

    const mappedRequirementAttributes = data.requirementsAttributes.map((ra) => {
      if (!ra?.inputOptions) return ra

      const { conditional, ...restOfInputOptions } = ra?.inputOptions

      const returnValue = {
        ...ra,
        inputOptions: {
          ...restOfInputOptions,
        } as any,
      }

      const shouldAppendConditional = conditional?.when && conditional?.operand && conditional?.then

      const isEnergyStepCodeDependency = Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
        ra.requirementCode as EEnergyStepCodeDependencyRequirementCode
      )

      // energy step code dependency conditionals is not possible to edit from the front-end and has default values
      // and follows a slightly different structure so we make sure not to remove them or alter them
      if (isEnergyStepCodeDependency) {
        returnValue.inputOptions.conditional = conditional
      } else if (shouldAppendConditional) {
        const cond = ra.inputOptions.conditional
        returnValue.inputOptions.conditional = {
          when: cond.when,
          eq: cond.operand,
          [cond.then]: true,
        }
      }

      return returnValue
    })

    if (requirementBlock) {
      const removedRequirementAttributes = requirementBlock.requirements
        .filter((requirement) => !data.requirementsAttributes.find((attribute) => attribute.id === requirement.id))
        .map((requirement) => ({ id: requirement.id, _destroy: true }))

      isSuccess = await (requirementBlock as IRequirementBlock).update?.({
        ...data,
        requirementsAttributes: [
          ...mappedRequirementAttributes,
          ...removedRequirementAttributes,
        ] as IRequirementAttributes[],
      })
      requirementBlockStore.fetchRequirementBlocks()
    } else {
      isSuccess = await createRequirementBlock({
        ...data,
        requirementsAttributes: [...mappedRequirementAttributes],
      })
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
                  <CalloutBanner type={"warning"} title={t("requirementsLibrary.modals.editWarning")} />
                )}
                <HStack spacing={9} w={"full"} h={"full"} alignItems={"flex-start"}>
                  <BlockSetup />
                  <FieldsSetup requirementBlock={requirementBlock} />
                </HStack>
              </ModalBody>
            </ModalContent>
          </FormProvider>
        </Modal>
      )}
    </>
  )
})
