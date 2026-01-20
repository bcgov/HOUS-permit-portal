import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
  Tag,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { Link } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { FormProvider, useController, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { getEnabledElectiveReasonOptions } from "../../../../../constants"
import { useMst } from "../../../../../setup/root"
import {
  EEnabledElectiveFieldReason,
  EFileScanStatus,
  EFlashMessageStatus,
  EResourceType,
} from "../../../../../types/enums"
import {
  IDenormalizedRequirement,
  IDenormalizedRequirementBlock,
  IRequirementBlockCustomization,
  IResource,
} from "../../../../../types/types"
import { getFileTypeInfo } from "../../../../../utils/file-utils"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { Editor } from "../../../../shared/editor/editor"
import { FileRemovedTag } from "../../../../shared/file-removed-tag"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"

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
    tip: customization?.tip ?? "",
    resourceIds: customization?.resourceIds || [],
    enabledElectiveFieldIds:
      customization?.enabledElectiveFieldIds?.filter((id) => !!availableElectiveFields.find((f) => f.id === id)) ?? [],
    optionalElectiveFieldIds: customization?.optionalElectiveFieldIds || [],
    enabledElectiveFieldReasons: customization?.enabledElectiveFieldReasons ?? {},
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
  const watchedOptionalElectiveFieldIds = watch("optionalElectiveFieldIds") ?? []
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
        <DrawerContent maxW="430px" paddingTop="var(--app-navbar-height)">
          <DrawerCloseButton top="var(--app-navbar-height)" />
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
                  existingOptionalElectiveFieldIds={watchedOptionalElectiveFieldIds}
                  electiveFields={electiveFields}
                  onCancel={() => setShowManageFieldsView(false)}
                  onAddFields={(fieldIds, optionalFieldIds, fieldReasons) => {
                    setValue("enabledElectiveFieldIds", fieldIds)
                    setValue("optionalElectiveFieldIds", optionalFieldIds)
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
  const { userStore } = useMst()
  const { currentUser } = userStore
  const currentJurisdiction = currentUser?.jurisdiction

  const { control, watch, setValue } = useFormContext<ICustomizationForm>()
  const {
    field: { value: tipValue, onChange: onTipChange },
  } = useController({ control, name: "tip" })

  const watchedEnabledElectiveFieldIds = watch("enabledElectiveFieldIds") ?? []
  const watchedOptionalElectiveFieldIds = watch("optionalElectiveFieldIds") ?? []
  const watchedEnabledElectiveFieldReasons = watch("enabledElectiveFieldReasons") ?? {}
  const watchedResourceIds = watch("resourceIds") ?? []

  // Group resources by category for display
  const resourcesByCategory = useMemo(() => {
    if (!currentJurisdiction?.resources) return {}

    return currentJurisdiction.resources.reduce(
      (acc, resource) => {
        if (!acc[resource.category]) acc[resource.category] = []
        acc[resource.category].push(resource)
        return acc
      },
      {} as Record<string, IResource[]>
    )
  }, [currentJurisdiction?.resources])

  const hasResources = currentJurisdiction?.resources?.length > 0

  const handleResourceToggle = (resourceId: string, isChecked: boolean) => {
    const currentIds = watchedResourceIds
    const newIds = isChecked ? [...currentIds, resourceId] : currentIds.filter((id) => id !== resourceId)
    setValue("resourceIds", newIds)
  }

  return (
    <Stack as={"section"} w={"full"} spacing={6} h="full">
      <Text color={"text.secondary"} fontSize={"sm"}>
        {t("digitalBuildingPermits.edit.requirementBlockSidebar.description")}
      </Text>
      <Box>
        <Text mb={1}>{t("digitalBuildingPermits.edit.requirementBlockSidebar.tipLabel")}</Text>
        <Editor htmlValue={tipValue} onChange={onTipChange} />
      </Box>

      {electiveFields.length > 0 && (
        <Box w={"full"}>
          {watchedEnabledElectiveFieldIds.length === 0 ? (
            <>
              <Text color={"text.secondary"} fontWeight={700} mb={2}>
                {t("digitalBuildingPermits.edit.requirementBlockSidebar.electiveFormFields")}
              </Text>
              <CustomMessageBox
                status={EFlashMessageStatus.info}
                description={t("digitalBuildingPermits.edit.requirementBlockSidebar.noElectiveFields")}
              />
            </>
          ) : (
            <Accordion allowMultiple w={"full"}>
              <AccordionItem border="none">
                <AccordionButton px={0}>
                  <Box as="span" flex="1" textAlign="left" fontWeight="bold" fontSize="md">
                    {t("digitalBuildingPermits.edit.requirementBlockSidebar.electiveFormFields")}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} px={0}>
                  <Stack w={"full"} spacing={2}>
                    {watchedEnabledElectiveFieldIds.map((requirementFieldId) => {
                      const requirementField = electiveFields.find((req) => req.id === requirementFieldId)
                      const reasonLabel =
                        getEnabledElectiveReasonOptions().find(
                          (o) => o.value === watchedEnabledElectiveFieldReasons[requirementFieldId]
                        )?.label || ""
                      const isOptional = watchedOptionalElectiveFieldIds.includes(requirementFieldId)

                      return (
                        <Box key={requirementField.id} borderRadius={"md"} bg={"theme.blueLight"} px={4} py={3}>
                          <Flex align="center" justify="space-between" mb={1}>
                            <Text fontWeight="bold" fontSize="sm">
                              {requirementField.label}
                            </Text>
                            <Tag size="sm" variant="solid" colorScheme={isOptional ? "gray" : "blue"}>
                              {isOptional ? t("ui.optional") : t("ui.required")}
                            </Tag>
                          </Flex>
                          <Text fontSize="sm" fontWeight="bold" mt={1}>
                            {t("digitalBuildingPermits.edit.requirementBlockSidebar.reason")} {reasonLabel}
                          </Text>
                          {requirementField.hint && (
                            <Text fontSize="sm" mt={1}>
                              {requirementField.hint}
                            </Text>
                          )}
                        </Box>
                      )
                    })}
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}

          {electiveFields?.length > 0 && (
            <Button variant={"link"} textDecoration={"underline"} onClick={onManageElectiveFields} mt={2}>
              {t("digitalBuildingPermits.edit.requirementBlockSidebar.manageFieldsButton")}
            </Button>
          )}
        </Box>
      )}

      <Box w="full">
        {!hasResources ? (
          <>
            <Text color="text.secondary" fontWeight={700} mb={2}>
              {t("digitalBuildingPermits.edit.requirementBlockSidebar.resourcesLabel")}
            </Text>
            <CustomMessageBox
              status={EFlashMessageStatus.info}
              description={
                <>
                  {t("digitalBuildingPermits.edit.requirementBlockSidebar.noResourcesYet")}{" "}
                  <RouterLink
                    to={`/jurisdictions/${currentJurisdiction.slug}/configuration-management/resources`}
                    target="_blank"
                    style={{ textDecoration: "underline" }}
                  >
                    {t("digitalBuildingPermits.edit.requirementBlockSidebar.addResourcesLink")}
                  </RouterLink>
                </>
              }
            />
          </>
        ) : (
          <Accordion allowMultiple w="full">
            <AccordionItem border="none">
              <AccordionButton px={0}>
                <Box as="span" flex="1" textAlign="left" fontWeight="bold" fontSize="md">
                  {t("digitalBuildingPermits.edit.requirementBlockSidebar.resourcesLabel")}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} px={0}>
                <VStack align="stretch" spacing={4}>
                  <RouterLinkButton
                    to={`/jurisdictions/${currentJurisdiction.slug}/configuration-management/resources`}
                    variant="link"
                  >
                    {t("digitalBuildingPermits.edit.requirementBlockSidebar.manageResourcesLink")}
                  </RouterLinkButton>
                  {(Object.entries(resourcesByCategory) as [string, IResource[]][]).map(([category, resources]) => (
                    <Box key={category}>
                      <Text fontSize="sm" fontWeight={600} mb={2}>
                        {t(`jurisdiction.resources.categories.${category}` as any)}
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        {resources.map((resource) => {
                          const isInfected =
                            resource.resourceType === EResourceType.file &&
                            resource.resourceDocument?.scanStatus === EFileScanStatus.infected

                          const fileTypeInfo =
                            resource.resourceType === "link"
                              ? { icon: <Link />, label: "LINK" }
                              : getFileTypeInfo(resource.resourceDocument?.file?.metadata?.mimeType)

                          return (
                            <Checkbox
                              key={resource.id}
                              isChecked={watchedResourceIds.includes(resource.id)}
                              onChange={(e) => handleResourceToggle(resource.id, e.target.checked)}
                              isDisabled={isInfected}
                            >
                              <Flex align="center" gap={2}>
                                {isInfected ? (
                                  <FileRemovedTag />
                                ) : (
                                  <Tag
                                    backgroundColor="semantic.infoLight"
                                    size="sm"
                                    fontWeight="medium"
                                    color="text.secondary"
                                  >
                                    <Flex align="center" gap={1}>
                                      {fileTypeInfo.icon}
                                      <Text as="span">{fileTypeInfo.label}</Text>
                                    </Flex>
                                  </Tag>
                                )}

                                <Text fontSize="sm">{resource.title}</Text>
                              </Flex>
                            </Checkbox>
                          )
                        })}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </Box>

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
  existingOptionalElectiveFieldIds = [],
  existingEnabledElectiveFieldReasons = {},
  onCancel,
  electiveFields,
  onAddFields,
}: {
  existingEnabledElectiveFieldIds: string[]
  existingOptionalElectiveFieldIds: string[]
  existingEnabledElectiveFieldReasons: Record<string, EEnabledElectiveFieldReason>
  electiveFields: IDenormalizedRequirement[]
  onAddFields: (
    fieldIds: string[],
    optionalFieldIds: string[],
    enabledElectiveFieldReasons: Record<string, EEnabledElectiveFieldReason>
  ) => void
  onCancel: () => void
}) => {
  const { t } = useTranslation()
  const [enabledFieldIds, setEnabledFieldIds] = useState<string[]>([...existingEnabledElectiveFieldIds])
  const [optionalFieldIds, setOptionalFieldIds] = useState<string[]>([...existingOptionalElectiveFieldIds])
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
      // Default to required (not in optional list)
      setOptionalFieldIds((prev) => prev.filter((id) => id !== fieldId))
    } else {
      setEnabledFieldIds((prev) => prev.filter((id) => id !== fieldId))
      setOptionalFieldIds((prev) => prev.filter((id) => id !== fieldId))
      removeReason(fieldId)
    }
  }

  const markAsRequired = (fieldId: string) => {
    setOptionalFieldIds((prev) => prev.filter((id) => id !== fieldId))
  }

  const markAsOptional = (fieldId: string) => {
    setOptionalFieldIds((prev) => [...prev, fieldId])
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
            const isRequired = !optionalFieldIds.includes(requirementField.id)

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
                        <>
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
                          <Checkbox
                            mt={2}
                            isChecked={isRequired}
                            onChange={(e) =>
                              e.target.checked
                                ? markAsRequired(requirementField.id)
                                : markAsOptional(requirementField.id)
                            }
                          >
                            <Text fontSize="sm">
                              {t("digitalBuildingPermits.edit.requirementBlockSidebar.requiredForSubmitter")}
                            </Text>
                          </Checkbox>
                        </>
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
            onClick={() =>
              onAddFields([...new Set(enabledFieldIds)], [...new Set(optionalFieldIds)], enabledFieldReasons)
            }
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
