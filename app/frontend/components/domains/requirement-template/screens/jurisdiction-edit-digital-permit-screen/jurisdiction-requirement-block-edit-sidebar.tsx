import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { FormProvider, useController, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  IDenormalizedRequirement,
  IDenormalizedRequirementBlock,
  IRequirementBlockCustomization,
} from "../../../../../types/types"
import { Editor } from "../../../../shared/editor/editor"

interface ICustomizationForm extends IRequirementBlockCustomization {}

interface IProps {
  requirementBlock: IDenormalizedRequirementBlock
  requirementBlockCustomization?: IRequirementBlockCustomization
  triggerButtonProps?: Partial<ButtonProps>
  onSave?: (requirementBlockId: string, customization: ICustomizationForm) => void
}

function formFormDefaults(
  availableElectiveFields: IDenormalizedRequirement[],
  customization: IRequirementBlockCustomization | undefined
): ICustomizationForm {
  return {
    tip: customization?.tip,
    enabledElectiveFieldIds: customization?.enabledElectiveFieldIds?.filter(
      (id) => !!availableElectiveFields.find((f) => f.id === id)
    ),
  }
}

export const JurisdictionRequirementBlockEditSidebar = observer(function JurisdictionRequirementBlockEditSidebar({
  requirementBlock,
  requirementBlockCustomization,
  triggerButtonProps,
  onSave,
}: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  const { t } = useTranslation()
  const electiveFields = requirementBlock?.requirements?.filter((req) => req.elective) ?? []
  const formMethods = useForm<ICustomizationForm>({
    defaultValues: formFormDefaults(electiveFields, requirementBlockCustomization),
  })
  const { watch, setValue, reset, handleSubmit, control } = formMethods
  const [showManageFieldsView, setShowManageFieldsView] = useState(false)

  const watchedEnabledElectiveFieldIds = watch("enabledElectiveFieldIds") ?? []

  useEffect(() => {
    if (isOpen) {
      reset(formFormDefaults(electiveFields, requirementBlockCustomization))
    }
  }, [requirementBlockCustomization, isOpen])

  const handleCancel = () => {
    reset(formFormDefaults(electiveFields, requirementBlockCustomization))
    setShowManageFieldsView(false)
    onClose()
  }

  const onSubmit = handleSubmit((data) => {
    onSave(requirementBlock.id, data)

    setShowManageFieldsView(false)
    onClose()
  })

  return (
    <>
      <Button
        ref={btnRef}
        variant={"link"}
        color={"text.primary"}
        textDecoration={"none"}
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
        textOverflow={"ellipsis"}
        overflow={"hidden"}
        whiteSpace={"nowrap"}
        {...triggerButtonProps}
      >
        {t("ui.edit")}
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={handleCancel} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent maxW="430px">
          <DrawerCloseButton />
          <DrawerHeader mt={4} px={8} pb={0} borderColor={"border.light"}>
            <Text as="h2" fontWeight={700} fontSize={"2xl"}>
              {requirementBlock.displayName}
            </Text>
          </DrawerHeader>

          <DrawerBody px={8}>
            <FormProvider {...formMethods}>
              {showManageFieldsView ? (
                <ManageElectiveFieldsView
                  existingEnabledElectiveFieldIds={watchedEnabledElectiveFieldIds}
                  electiveFields={electiveFields}
                  onCancel={() => setShowManageFieldsView(false)}
                  onAddFields={(fieldIds) => {
                    setValue("enabledElectiveFieldIds", fieldIds)
                    setShowManageFieldsView(false)
                  }}
                />
              ) : (
                <MainView
                  electiveFields={electiveFields}
                  onDone={onSubmit}
                  onCancel={handleCancel}
                  onManageElectiveFields={() => setShowManageFieldsView(true)}
                />
              )}
            </FormProvider>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
})

const MainView = ({
  electiveFields,
  onDone,
  onCancel,
  onManageElectiveFields,
}: {
  electiveFields: IDenormalizedRequirement[]
  onDone: () => void
  onCancel: () => void
  onManageElectiveFields: () => void
}) => {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<ICustomizationForm>()
  const {
    field: { value: tipValue, onChange: onTipChange },
  } = useController({ control, name: "tip" })
  const watchedEnabledElectiveFieldIds = watch("enabledElectiveFieldIds") ?? []

  return (
    <Stack as={"section"} w={"full"} spacing={6}>
      <Text color={"text.secondary"} fontSize={"sm"}>
        {t("digitalBuildingPermits.edit.requirementBlockSidebar.description")}
      </Text>
      <Box sx={{ ".ql-container": { h: "112px" } }}>
        <Text mb={1}>{t("digitalBuildingPermits.edit.requirementBlockSidebar.tipLabel")}</Text>
        <Editor htmlValue={tipValue} onChange={onTipChange} />
      </Box>

      <Box w={"full"}>
        <Text color={"text.secondary"} fontWeight={700}>
          {t("digitalBuildingPermits.edit.requirementBlockSidebar.electiveFormFields")}
        </Text>
        <Stack w={"full"} spacing={2} mt={3}>
          {watchedEnabledElectiveFieldIds.map((requirementFieldId) => {
            const requirementField = electiveFields.find((req) => req.id === requirementFieldId)
            return (
              <Box key={requirementField.id} borderRadius={"md"} bg={"theme.blueLight"} px={4} py={1}>
                {requirementField.label}
              </Box>
            )
          })}
        </Stack>
      </Box>
      <Button variant={"link"} textDecoration={"underline"} onClick={onManageElectiveFields}>
        {t("digitalBuildingPermits.edit.requirementBlockSidebar.manageFieldsButton")}
      </Button>
      <ButtonGroup size={"md"}>
        <Button variant={"primary"} flex={1} onClick={onDone}>
          {t("ui.done")}
        </Button>
        <Button variant={"secondary"} flex={1} onClick={onCancel}>
          {t("ui.cancel")}
        </Button>
      </ButtonGroup>
    </Stack>
  )
}

const ManageElectiveFieldsView = ({
  existingEnabledElectiveFieldIds,
  onCancel,
  electiveFields,
  onAddFields,
}: {
  existingEnabledElectiveFieldIds: string[]
  electiveFields: IDenormalizedRequirement[]
  onAddFields: (fieldIds: string[]) => void
  onCancel: () => void
}) => {
  const { t } = useTranslation()
  const [enabledFieldIds, setEnabledFieldIds] = useState<string[]>([...existingEnabledElectiveFieldIds])

  const onFieldEnableChange = (fieldId: string, isEnabled: boolean) => {
    if (isEnabled) {
      setEnabledFieldIds((prev) => [...prev, fieldId])
    } else {
      setEnabledFieldIds((prev) => prev.filter((id) => id !== fieldId))
    }
  }
  return (
    <Stack as={"section"} w={"full"} spacing={6} mt={7}>
      <Text color={"text.secondary"} fontWeight={700}>
        {t("digitalBuildingPermits.edit.requirementBlockSidebar.selectFieldsTitle")}
      </Text>
      <Stack w={"full"} spacing={4}>
        {electiveFields.map((requirementField) => {
          return (
            <Stack
              key={requirementField.id}
              flexDir={"row"}
              spacing={2}
              borderRadius={"md"}
              border={"1px solid"}
              borderColor={"border.light"}
              bg={"theme.blueLight"}
              px={4}
              py={2}
            >
              <Checkbox
                isChecked={enabledFieldIds.includes(requirementField.id)}
                onChange={(e) => onFieldEnableChange(requirementField.id, e.target.checked)}
              />
              <Text fontWeight={700}>{requirementField.label}</Text>
            </Stack>
          )
        })}
      </Stack>

      <ButtonGroup size={"md"} justifyContent={"flex-start"} gap={6}>
        <Button variant={"primary"} onClick={() => onAddFields([...new Set(enabledFieldIds)])}>
          {t("digitalBuildingPermits.edit.requirementBlockSidebar.addSelectedButton")}
        </Button>
        <Button variant={"secondary"} onClick={onCancel}>
          {t("ui.cancel")}
        </Button>
      </ButtonGroup>
    </Stack>
  )
}
