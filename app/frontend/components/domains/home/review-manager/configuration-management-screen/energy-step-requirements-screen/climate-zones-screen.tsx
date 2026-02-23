import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react"
import { CaretLeft, Pencil, Plus, Trash } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { ConfirmationModal } from "../../../../../shared/modals/confirmation-modal"
import { i18nPrefix } from "./i18n-prefix"

const CLIMATE_ZONE_OPTIONS = ["zone_4", "zone_5", "zone_6", "zone_7a", "zone_7b", "zone_8"] as const

type TCzPrefix = `${typeof i18nPrefix}.climateZones`
const czPrefix: TCzPrefix = `${i18nPrefix}.climateZones`

const HDD_MIN = 1
const HDD_MAX = 10000

interface IClimateZoneField {
  recordId?: string
  climateZone: string
  heatingDegreeDays: number | null
}

interface IFormValues {
  zones: IClimateZoneField[]
}

function EmptyState() {
  const { t } = useTranslation()

  return (
    <Box w="full" borderWidth={1} borderColor="border.light" rounded="sm" p={6}>
      <Text fontWeight="bold" mb={2}>
        {t(`${czPrefix}.emptyState.title`)}
      </Text>
      <Text color="text.secondary">{t(`${czPrefix}.emptyState.description`)}</Text>
    </Box>
  )
}

interface IAddClimateZoneFormProps {
  onAdd: (climateZone: string, heatingDegreeDays: number | null) => void
  onCancel: () => void
  existingZones: string[]
}

function AddClimateZoneForm({ onAdd, onCancel, existingZones }: IAddClimateZoneFormProps) {
  const { t } = useTranslation()

  const addForm = useForm<{ climateZone: string; heatingDegreeDays: string }>({
    mode: "onChange",
    defaultValues: { climateZone: "", heatingDegreeDays: "" },
  })

  const availableZones = CLIMATE_ZONE_OPTIONS.filter((z) => !existingZones.includes(z))

  const handleAddSubmit = addForm.handleSubmit((values) => {
    const hdd = values.heatingDegreeDays ? Number(values.heatingDegreeDays) : null
    onAdd(values.climateZone, hdd)
    addForm.reset()
  })

  return (
    <Box w="full">
      <FormControl isInvalid={!!addForm.formState.errors.climateZone} mb={4}>
        <FormLabel fontWeight="bold">{t(`${czPrefix}.bcClimateZone`)}</FormLabel>
        <Controller
          control={addForm.control}
          name="climateZone"
          rules={{ required: t(`${czPrefix}.validation.zoneRequired`) }}
          render={({ field: { onChange, value } }) => (
            <RadioGroup value={value} onChange={onChange}>
              <Stack spacing={2}>
                {availableZones.map((zone) => (
                  <Radio key={zone} value={zone}>
                    {t(`${czPrefix}.zoneShortLabels.${zone}`)}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          )}
        />
        <FormErrorMessage>{addForm.formState.errors.climateZone?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!addForm.formState.errors.heatingDegreeDays} mb={4} maxW="250px">
        <FormLabel fontWeight="bold">{t(`${czPrefix}.heatingDegreeDaysLabel`)}</FormLabel>
        <Input
          type="number"
          {...addForm.register("heatingDegreeDays", {
            validate: (value) => {
              if (!value) return true
              const num = Number(value)
              if (isNaN(num) || num < HDD_MIN) return t(`${czPrefix}.validation.hddMin`)
              if (num > HDD_MAX) return t(`${czPrefix}.validation.hddMax`)
              return true
            },
          })}
        />
        <FormErrorMessage>{addForm.formState.errors.heatingDegreeDays?.message}</FormErrorMessage>
      </FormControl>

      <HStack spacing={3}>
        <Button variant="outline" onClick={onCancel}>
          {t(`${czPrefix}.cancel`)}
        </Button>
        <Button variant="primary" onClick={handleAddSubmit} isDisabled={!addForm.formState.isValid}>
          {t(`${czPrefix}.save`)}
        </Button>
      </HStack>
    </Box>
  )
}

interface IClimateZonesFormProps {
  jurisdiction: IJurisdiction
}

function ClimateZonesForm({ jurisdiction }: IClimateZonesFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getDefaultValues = (): IFormValues => ({
    zones: [...jurisdiction.jurisdictionClimateZones]
      .sort((a, b) => {
        const order = CLIMATE_ZONE_OPTIONS as readonly string[]
        return order.indexOf(a.climateZone) - order.indexOf(b.climateZone)
      })
      .map((cz) => ({
        recordId: cz.id,
        climateZone: cz.climateZone,
        heatingDegreeDays: cz.heatingDegreeDays,
      })),
  })

  const { handleSubmit, control, formState, reset, register } = useForm<IFormValues>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "zones",
  })

  const [removedRecordIds, setRemovedRecordIds] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const isDirty = formState.isDirty || removedRecordIds.length > 0

  const existingZones = fields.map((f) => f.climateZone)
  const allZonesAdded = existingZones.length >= CLIMATE_ZONE_OPTIONS.length

  const handleAdd = (climateZone: string, heatingDegreeDays: number | null) => {
    append({ climateZone, heatingDegreeDays })
    setIsAdding(false)
  }

  const onRemove = (index: number) => {
    const field = fields[index]
    if (field.recordId) {
      setRemovedRecordIds((prev) => [...prev, field.recordId])
    }
    remove(index)
    if (editingIndex === index) setEditingIndex(null)
  }

  const onSubmit = async (values: IFormValues) => {
    const attributes = [
      ...values.zones.map((z) => ({
        id: z.recordId || undefined,
        climateZone: z.climateZone,
        heatingDegreeDays: z.heatingDegreeDays,
      })),
      ...removedRecordIds.map((id) => ({ id, _destroy: true })),
    ]

    const ok = await jurisdiction.update({
      jurisdictionClimateZonesAttributes: attributes,
    })

    if (ok) {
      setRemovedRecordIds([])
      setEditingIndex(null)
      reset(getDefaultValues())
    }
  }

  const handleCancel = () => {
    setRemovedRecordIds([])
    setEditingIndex(null)
    setIsAdding(false)
    reset(getDefaultValues())
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
      <VStack spacing={6} align="start" w="full">
        {!isAdding && !allZonesAdded && (
          <Button variant="outline" size="sm" leftIcon={<Plus />} onClick={() => setIsAdding(true)}>
            {t(`${czPrefix}.addClimateZone`)}
          </Button>
        )}

        {isAdding && (
          <AddClimateZoneForm existingZones={existingZones} onAdd={handleAdd} onCancel={() => setIsAdding(false)} />
        )}

        {fields.length > 0 ? (
          <Box w="full" borderWidth={1} borderColor="border.light" rounded="sm" overflow="hidden">
            <Table variant="simple" size="md">
              <Thead>
                <Tr bg="greys.grey03">
                  <Th>{t(`${czPrefix}.tableClimateZone`)}</Th>
                  <Th>{t(`${czPrefix}.tableHdd`)}</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {fields.map((field, index) => {
                  const isEditing = editingIndex === index
                  const fieldError = formState.errors.zones?.[index]?.heatingDegreeDays

                  return (
                    <Tr key={field.id}>
                      {/* @ts-ignore - dynamic climate zone key */}
                      <Td>{t(`${czPrefix}.zoneLabels.${field.climateZone}`)}</Td>
                      <Td>
                        {isEditing ? (
                          <HStack spacing={2}>
                            <FormControl isInvalid={!!fieldError} maxW="150px">
                              <Controller
                                control={control}
                                name={`zones.${index}.heatingDegreeDays`}
                                rules={{
                                  validate: (value) => {
                                    if (value === null || value === undefined) return true
                                    const num = Number(value)
                                    if (isNaN(num) || num < HDD_MIN) return t(`${czPrefix}.validation.hddMin`)
                                    if (num > HDD_MAX) return t(`${czPrefix}.validation.hddMax`)
                                    return true
                                  },
                                }}
                                render={({ field: { onChange, value } }) => (
                                  <Input
                                    type="number"
                                    size="sm"
                                    autoFocus
                                    value={value ?? ""}
                                    onChange={(e) => {
                                      const raw = e.target.value
                                      onChange(raw === "" ? null : Number(raw))
                                    }}
                                  />
                                )}
                              />
                              {fieldError && <FormErrorMessage fontSize="xs">{fieldError.message}</FormErrorMessage>}
                            </FormControl>
                            <IconButton
                              aria-label="done editing"
                              icon={<Pencil size={16} />}
                              variant="ghost"
                              size="xs"
                              onClick={() => setEditingIndex(null)}
                            />
                          </HStack>
                        ) : (
                          <HStack spacing={2}>
                            <Text color={field.heatingDegreeDays ? "text.primary" : "text.secondary"}>
                              {field.heatingDegreeDays ?? t(`${czPrefix}.notConfigured`)}
                            </Text>
                            <IconButton
                              aria-label="edit HDD"
                              icon={<Pencil size={16} />}
                              variant="ghost"
                              size="xs"
                              onClick={() => setEditingIndex(index)}
                            />
                          </HStack>
                        )}
                      </Td>
                      <Td>
                        <ConfirmationModal
                          onConfirm={() => onRemove(index)}
                          promptHeader={t(`${czPrefix}.removeConfirmationModal.title`)}
                          promptMessage={t(`${czPrefix}.removeConfirmationModal.body`)}
                          confirmText={t(`${czPrefix}.remove`)}
                          renderTrigger={(onOpen) => (
                            <Button
                              variant="link"
                              size="sm"
                              leftIcon={<Trash size={14} />}
                              color="text.secondary"
                              fontWeight="normal"
                              onClick={onOpen}
                            >
                              {t(`${czPrefix}.remove`)}
                            </Button>
                          )}
                        />
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>
        ) : (
          !isAdding && <EmptyState />
        )}

        {isDirty && (
          <HStack spacing={3}>
            <Button variant="outline" onClick={handleCancel}>
              {t(`${czPrefix}.cancel`)}
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={formState.isSubmitting}
              isDisabled={formState.isSubmitting || !formState.isValid}
            >
              {t(`${czPrefix}.save`)}
            </Button>
          </HStack>
        )}
      </VStack>
    </form>
  )
}

export const ClimateZonesScreen = observer(function ClimateZonesScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentJurisdiction, error } = useJurisdiction()

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
      <VStack spacing={6} align="start" w="full">
        <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </Button>

        <Heading mb={0} fontSize="3xl">
          {t(`${i18nPrefix}.climateZonesTitle`)}
        </Heading>

        <Text>{t(`${czPrefix}.description`)}</Text>
        <Text>{t(`${czPrefix}.hddDescription`)}</Text>

        <ClimateZonesForm jurisdiction={currentJurisdiction} />
      </VStack>
    </Container>
  )
})
