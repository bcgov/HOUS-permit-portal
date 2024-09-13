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
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { FormProvider, useController, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { getEnabledElectiveReasonOptions } from "../../../../../constants"
import { EEnabledElectiveFieldReason } from "../../../../../types/enums"
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
  onResetDefault?: (requirementBlockId: string) => ICustomizationForm | undefined
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
    enabledElectiveFieldReasons: customization?.enabledElectiveFieldReasons,
  }
}

export const JurisdictionRequirementBlockEditSidebar = observer(function JurisdictionRequirementBlockEditSidebar({
  requirementBlock,
  requirementBlockCustomization,
  triggerButtonProps,
  onSave,
  onResetDefault,
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
  const watchedEnabledElectiveFieldReasons = watch("enabledElectiveFieldReasons") ?? {}

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

          <DrawerBody px={8} py={0}>
            <FormProvider {...formMethods}>
              {showManageFieldsView ? (
                <ManageElectiveFieldsView
                  existingEnabledElectiveFieldIds={watchedEnabledElectiveFieldIds}
                  electiveFields={electiveFields}
                  onCancel={() => setShowManageFieldsView(false)}
                  onAddFields={(fieldIds, fieldReasons) => {
                    setValue("enabledElectiveFieldIds", fieldIds)
                    setValue("enabledElectiveFieldReasons", fieldReasons)
                    setShowManageFieldsView(false)
                  }}
                  existingEnabledElectiveFieldReasons={watchedEnabledElectiveFieldReasons}
                />
              ) : (
                <MainView
                  electiveFields={electiveFields}
                  onDone={onSubmit}
                  onCancel={handleCancel}
                  onManageElectiveFields={() => setShowManageFieldsView(true)}
                  onResetDefault={() => {
                    const defaultCustomization = onResetDefault(requirementBlock.id)
                    defaultCustomization && reset(formFormDefaults(electiveFields, defaultCustomization))
                  }}
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
  onResetDefault,
}: {
  electiveFields: IDenormalizedRequirement[]
  onDone: () => void
  onCancel: () => void
  onManageElectiveFields: () => void
  onResetDefault?: () => void
}) => {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<ICustomizationForm>()
  const {
    field: { value: tipValue, onChange: onTipChange },
  } = useController({ control, name: "tip" })
  const watchedEnabledElectiveFieldIds = watch("enabledElectiveFieldIds") ?? []

  return (
    <Stack as={"section"} w={"full"} spacing={6} h="full">
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
      {electiveFields?.length > 0 && (
        <Button variant={"link"} textDecoration={"underline"} onClick={onManageElectiveFields}>
          {t("digitalBuildingPermits.edit.requirementBlockSidebar.manageFieldsButton")}
        </Button>
      )}
      <ButtonGroup size={"md"}>
        <Button
          variant={"primary"}
          flex={1}
          onClick={(e) => {
            e.stopPropagation()
            onDone()
          }}
        >
          {t("ui.done")}
        </Button>
        <Button variant={"secondary"} flex={1} onClick={onCancel}>
          {t("ui.cancel")}
        </Button>
      </ButtonGroup>

      <Button variant={"link"} textDecoration={"underline"} onClick={onResetDefault}>
        {t("digitalBuildingPermits.edit.requirementBlockSidebar.resetToDefaults")}
      </Button>
    </Stack>
  )
}

const ManageElectiveFieldsView = ({
  existingEnabledElectiveFieldIds,
  existingEnabledElectiveFieldReasons = {},
  onCancel,
  electiveFields,
  onAddFields,
}: {
  existingEnabledElectiveFieldIds: string[]
  existingEnabledElectiveFieldReasons: Record<string, EEnabledElectiveFieldReason>
  electiveFields: IDenormalizedRequirement[]
  onAddFields: (fieldIds: string[], enabledElectiveFieldReasons: Record<string, EEnabledElectiveFieldReason>) => void
  onCancel: () => void
}) => {
  const { t } = useTranslation()
  const [enabledFieldIds, setEnabledFieldIds] = useState<string[]>([...existingEnabledElectiveFieldIds])
  const [enabledFieldReasons, setEnabledFieldReasons] = useState<Record<string, EEnabledElectiveFieldReason>>(
    existingEnabledElectiveFieldReasons ?? {}
  )

  // New state variables for filtering and sorting
  const [filterText, setFilterText] = useState<string>("")
  const [sortOption, setSortOption] = useState<string>("labelAsc")

  const removeReason = (fieldId: string) => {
    setEnabledFieldReasons((prev) => {
      const newReasons = { ...prev }
      delete newReasons[fieldId]
      return newReasons
    })
  }

  const onFieldEnableChange = (fieldId: string, isEnabled: boolean) => {
    if (isEnabled) {
      setEnabledFieldIds((prev) => [...prev, fieldId])
    } else {
      setEnabledFieldIds((prev) => prev.filter((id) => id !== fieldId))
      removeReason(fieldId)
    }
  }

  const onReasonChange = (fieldId: string, reason: EEnabledElectiveFieldReason) => {
    setEnabledFieldReasons((prev) => ({ ...prev, [fieldId]: reason }))
  }

  const isAddValid = enabledFieldIds.every((id) => !!enabledFieldReasons[id])

  // Filtering and sorting logic using useMemo for performance optimization
  const filteredAndSortedFields = useMemo(() => {
    // Filter electiveFields based on filterText
    const filtered = electiveFields.filter((field) => field.label.toLowerCase().includes(filterText.toLowerCase()))

    // Sort based on sortOption
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "labelAsc":
          return a.label.localeCompare(b.label)
        case "labelDesc":
          return b.label.localeCompare(a.label)
        case "reasonAsc":
          // Handle cases where reason might be undefined
          const reasonA = enabledFieldReasons[a.id] || ""
          const reasonB = enabledFieldReasons[b.id] || ""
          return reasonA.localeCompare(reasonB)
        case "reasonDesc":
          const reasonADesc = enabledFieldReasons[a.id] || ""
          const reasonBDesc = enabledFieldReasons[b.id] || ""
          return reasonBDesc.localeCompare(reasonADesc)
        default:
          return 0
      }
    })

    return sorted
  }, [electiveFields, filterText, sortOption, enabledFieldReasons])

  return (
    <>
      <Stack
        direction={"row"}
        spacing={4}
        align="center"
        w="full"
        py={4}
        my={4}
        top={0}
        position="sticky"
        zIndex={10}
        bg="greys.white"
        borderTop="1px solid"
        borderColor="border.light"
      >
        {/* Filter Text Box */}
        <FormControl w="full">
          <FormLabel>{t("digitalBuildingPermits.edit.requirementBlockSidebar.filterLabel")}</FormLabel>
          <Input
            placeholder={t("digitalBuildingPermits.edit.requirementBlockSidebar.filterPlaceholder")}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </FormControl>

        {/* Sort Dropdown */}
        <FormControl w="full">
          <FormLabel>{t("digitalBuildingPermits.edit.requirementBlockSidebar.sortLabel")}</FormLabel>
          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="labelAsc">
              {t("digitalBuildingPermits.edit.requirementBlockSidebar.sortOptions.labelAsc")}
            </option>
            <option value="labelDesc">
              {t("digitalBuildingPermits.edit.requirementBlockSidebar.sortOptions.labelDesc")}
            </option>
            <option value="reasonAsc">
              {t("digitalBuildingPermits.edit.requirementBlockSidebar.sortOptions.reasonAsc")}
            </option>
            <option value="reasonDesc">
              {t("digitalBuildingPermits.edit.requirementBlockSidebar.sortOptions.reasonDesc")}
            </option>
          </Select>
        </FormControl>
      </Stack>
      <Stack as={"section"} w={"full"} spacing={6} mt={7} h="full">
        <Text color={"text.secondary"} fontWeight={700}>
          {t("digitalBuildingPermits.edit.requirementBlockSidebar.selectFieldsTitle")}
        </Text>

        <Stack w={"full"} spacing={4}>
          {filteredAndSortedFields.map((requirementField) => {
            const enabled = enabledFieldIds.includes(requirementField.id)
            return (
              <Stack key={requirementField.id} mb="8">
                <Box
                  flexDir={"column"}
                  borderRadius={"md"}
                  border={"1px solid"}
                  borderColor={"border.light"}
                  bg={"theme.blueLight"}
                  px={4}
                  py={6}
                  gap={2}
                >
                  <Flex align="start" gap={2}>
                    <Checkbox
                      borderColor={"border.input"}
                      isChecked={enabled}
                      onChange={(e) => onFieldEnableChange(requirementField.id, e.target.checked)}
                    />
                    <Box>
                      <Text fontWeight={700}>{requirementField.label}</Text>
                      {enabled && (
                        <FormControl maxW={"200px"} isRequired={enabled} mt={2}>
                          <FormLabel>{t("digitalBuildingPermits.edit.requirementBlockSidebar.reason")}</FormLabel>
                          <Select
                            bg="greys.white"
                            value={enabledFieldReasons[requirementField.id] || ""}
                            placeholder={t(
                              "digitalBuildingPermits.edit.requirementBlockSidebar.reasonLabels.placeholder"
                            )}
                            onChange={(e) =>
                              onReasonChange(requirementField.id, e.target.value as EEnabledElectiveFieldReason)
                            }
                          >
                            {getEnabledElectiveReasonOptions().map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  </Flex>
                </Box>
              </Stack>
            )
          })}
        </Stack>
        <Spacer />

        <ButtonGroup
          size={"md"}
          py={4}
          gap={6}
          bottom={0}
          position="sticky"
          bg="greys.white"
          borderTop="1px solid"
          borderColor="border.light"
        >
          <Button
            variant={"primary"}
            onClick={() => onAddFields([...new Set(enabledFieldIds)], enabledFieldReasons)}
            isDisabled={!isAddValid}
          >
            {t("digitalBuildingPermits.edit.requirementBlockSidebar.addSelectedButton")}
          </Button>
          <Button variant={"secondary"} onClick={onCancel}>
            {t("ui.cancel")}
          </Button>
        </ButtonGroup>
      </Stack>
    </>
  )
}
