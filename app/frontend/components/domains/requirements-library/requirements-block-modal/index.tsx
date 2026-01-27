import {
  Button,
  ButtonProps,
  HStack,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Tag,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Archive } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useAutoComplianceModuleConfigurations } from "../../../../hooks/resources/use-auto-compliance-module-configurations"
import { IRequirementBlock } from "../../../../models/requirement-block"
import { useMst } from "../../../../setup/root"
import { IFormConditional, IRequirementAttributes, IRequirementBlockParams } from "../../../../types/api-request"
import {
  EArchitecturalDrawingDependencyRequirementCode,
  EEnergyStepCodeDependencyRequirementCode,
  EEnergyStepCodePart3DependencyRequirementCode,
  EVisibility,
} from "../../../../types/enums"
import { IDenormalizedRequirementBlock, TAutoComplianceModuleConfigurations } from "../../../../types/types"
import { AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX } from "../../../../utils"
import { isOptionsMapperModuleConfiguration } from "../../../../utils/utility-functions"
import { CalloutBanner } from "../../../shared/base/callout-banner"
import { FormModal } from "../../../shared/form-modal"
import { BlockSetup } from "./block-setup"
import { FieldsSetup } from "./fields-setup"

export interface IRequirementBlockForm extends IRequirementBlockParams {
  sku?: string
}

interface IRequirementsBlockProps {
  requirementBlock?: IRequirementBlock | IDenormalizedRequirementBlock
  showEditWarning?: boolean
  triggerButtonProps?: Partial<ButtonProps>
  withOptionsMenu?: boolean
  isEditable?: boolean
  forEarlyAccess?: boolean
}

export const RequirementsBlockModal = observer(function RequirementsBlockModal({
  requirementBlock,
  showEditWarning,
  triggerButtonProps,
  withOptionsMenu,
  isEditable,
  forEarlyAccess,
}: IRequirementsBlockProps) {
  const { requirementBlockStore, earlyAccessRequirementBlockStore } = useMst()
  const searchModel = forEarlyAccess ? earlyAccessRequirementBlockStore : requirementBlockStore
  const { t } = useTranslation()
  const { fetchData } = searchModel
  const { createRequirementBlock, isEditingEarlyAccess } = requirementBlockStore
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { autoComplianceModuleConfigurations, error } = useAutoComplianceModuleConfigurations()

  const getDefaultValues = (): Partial<IRequirementBlockForm> => {
    return requirementBlock
      ? {
          name: requirementBlock.name,
          firstNations: requirementBlock.firstNations,
          description: requirementBlock.description,
          displayName: requirementBlock.displayName,
          visibility: requirementBlock.visibility || EVisibility.any,
          displayDescription: requirementBlock.displayDescription,
          sku: (requirementBlock as IRequirementBlock).sku,
          associationList: (requirementBlock as IRequirementBlock).associations,
          requirementsAttributes: (requirementBlock as IRequirementBlock).requirementFormDefaults,
          requirementDocumentsAttributes: (requirementBlock as IRequirementBlock).requirementDocuments,
        }
      : {
          visibility: forEarlyAccess ? EVisibility.earlyAccess : EVisibility.any,
          associationList: [],
          requirementsAttributes: [],
          requirementDocumentsAttributes: [],
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

    const mappedRequirementAttributes = data.requirementsAttributes.map((ra, index) => {
      // set order of the requirement
      ra.position = index
      if (ra.id?.startsWith("dummy-")) {
        // remove dummy id to prevent backend from trying to update a non-existent record
        ra.id = undefined
      }
      if (!ra?.inputOptions) return ra

      const { conditional, ...restOfInputOptions } = ra?.inputOptions

      const formConditional = conditional as IFormConditional

      const processedRequirementAttributes = {
        ...ra,
        inputOptions: {
          ...restOfInputOptions,
        } as any,
      }

      const hasPreconfiguredConditional =
        Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
          ra.requirementCode as EEnergyStepCodeDependencyRequirementCode
        ) ||
        Object.values(EEnergyStepCodePart3DependencyRequirementCode).includes(
          ra.requirementCode as EEnergyStepCodePart3DependencyRequirementCode
        ) ||
        Object.values(EArchitecturalDrawingDependencyRequirementCode).includes(
          ra.requirementCode as EArchitecturalDrawingDependencyRequirementCode
        )

      const cond = ra.inputOptions.conditional as IFormConditional
      if (cond?.when && cond?.operand && cond?.then) {
        processedRequirementAttributes.inputOptions.conditional = {
          when: cond.when,
          eq: cond.operand,
          [cond.then]: true,
        }
      } else if (hasPreconfiguredConditional && cond) {
        processedRequirementAttributes.inputOptions.conditional = cond
      }
      return getPrunedOptionsMapperComplianceConfiguration(
        processedRequirementAttributes,
        autoComplianceModuleConfigurations
      )
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
        requirementDocumentsAttributes: data.requirementDocumentsAttributes,
      })
    } else {
      // For new blocks, include any documents that were uploaded
      isSuccess = await createRequirementBlock({
        ...data,
        requirementsAttributes: [...mappedRequirementAttributes],
        requirementDocumentsAttributes: data.requirementDocumentsAttributes || [],
      })
    }
    if (isSuccess) {
      fetchData()
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues())
    }
  }, [isOpen, requirementBlock])

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
        <FormModal
          onClose={onClose}
          isOpen
          formProps={formProps}
          confirmCloseTitle={t("requirementsLibrary.modals.unsavedChanges.title")}
          confirmCloseBody={t("requirementsLibrary.modals.unsavedChanges.body")}
          confirmCloseButtonText={t("requirementsLibrary.modals.unsavedChanges.discard")}
        >
          <ModalCloseButton fontSize={"11px"} />
          {(requirementBlock as IRequirementBlock)?.isDiscarded && (
            <Tag
              borderRadius="sm"
              border="1px solid"
              borderColor={"semantic.error"}
              backgroundColor={"semantic.errorLight"}
              w={"fit-content"}
              py={1}
              px={2}
              color={"semantic.error"}
              ml={"2.75rem"}
              mb={2}
            >
              <HStack>
                <Archive />
                <Text textTransform={"capitalize"} fontSize={"sm"}>
                  {t("requirementsLibrary.modals.archived")}
                </Text>
              </HStack>
            </Tag>
          )}
          <ModalHeader display={"flex"} justifyContent={"space-between"} p={0} px={"2.75rem"}>
            <Text as={"h2"} fontSize={"2xl"}>
              {t(`requirementsLibrary.modals.${requirementBlock ? "edit" : "create"}.title`)}
            </Text>
            <HStack>
              <Button
                variant={"primary"}
                isLoading={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubmit(onSubmit)()
                }}
              >
                {t("ui.onlySave")}
              </Button>
              <Button variant={"secondary"} onClick={onClose} isDisabled={isSubmitting}>
                {t("ui.cancel")}
              </Button>
            </HStack>
          </ModalHeader>
          <ModalBody px={"2.75rem"}>
            {showEditWarning && (
              <CalloutBanner
                type={"warning"}
                title={
                  isEditingEarlyAccess
                    ? t("requirementsLibrary.modals.previewEditWarning")
                    : t("requirementsLibrary.modals.templateEditWarning")
                }
              />
            )}
            <HStack spacing={9} w={"full"} h={"full"} alignItems={"flex-start"}>
              <BlockSetup
                forEarlyAccess={forEarlyAccess}
                requirementBlock={
                  (requirementBlock as IRequirementBlock)?.restore ? (requirementBlock as IRequirementBlock) : undefined
                }
                withOptionsMenu={withOptionsMenu}
              />

              <FieldsSetup requirementBlock={requirementBlock} isEditable={isEditable} />
            </HStack>
          </ModalBody>
        </FormModal>
      )}
    </>
  )
})

function getPrunedOptionsMapperComplianceConfiguration(
  requirementAttributes: IRequirementAttributes,
  autoComplianceModuleConfigurations: TAutoComplianceModuleConfigurations
) {
  const clonedAttributes = R.clone(requirementAttributes) as IRequirementAttributes

  const moduleName = clonedAttributes.inputOptions?.computedCompliance?.module

  if (!moduleName) {
    return clonedAttributes
  }

  const moduleConfig = autoComplianceModuleConfigurations?.[moduleName]

  if (!isOptionsMapperModuleConfiguration(moduleConfig)) {
    return clonedAttributes
  }

  const valueOptions = clonedAttributes.inputOptions?.valueOptions ?? []

  if (valueOptions.length === 0) {
    // remove the computed compliance if there are no value options (could happen if options were removed after mapping)
    delete clonedAttributes.inputOptions.computedCompliance

    return clonedAttributes
  }

  const optionsMap = clonedAttributes.inputOptions.computedCompliance?.optionsMap ?? {}

  Object.entries(optionsMap).forEach(([key, value]) => {
    if (!valueOptions.find((option) => option.value === value)) {
      delete optionsMap[key]
    }
  })

  if (Object.keys(optionsMap).length === 0) {
    delete clonedAttributes.inputOptions.computedCompliance
  }

  // this needs to be done to prevent decamelizing the computed compliance options map keys
  // as conversion results in unexpected behaviour
  // for example value Y is converted to y, when we don't want to change the key
  clonedAttributes.inputOptions.computedCompliance.optionsMap = Object.entries(optionsMap).reduce(
    (acc, [key, value]) => {
      acc[`${AUTO_COMPLIANCE_OPTIONS_MAP_KEY_PREFIX}${key}`] = value
      return acc
    },
    {}
  )

  return clonedAttributes
}
