import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  Heading,
  HStack,
  IconButton,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react"
import { CaretLeft, Plus, Trash } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { climateZoneFromHdd, climateZoneShortLabel } from "../../../../../../utils/climate-zone"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { i18nPrefix } from "./i18n-prefix"

type TCzPrefix = `${typeof i18nPrefix}.climateZones`
const czPrefix: TCzPrefix = `${i18nPrefix}.climateZones`

const HDD_MIN = 1
const HDD_MAX = 10000

interface ILocationField {
  recordId?: string
  locationName: string
  heatingDegreeDays: number | null
  _destroy?: boolean
}

interface IFormValues {
  locations: ILocationField[]
}

interface IClimateZonesFormProps {
  jurisdiction: IJurisdiction
}

function ClimateZoneCell({ hdd, isMarkedForRemoval }: { hdd: number | null; isMarkedForRemoval?: boolean }) {
  const zone = climateZoneFromHdd(hdd)
  return (
    <Text textDecoration={isMarkedForRemoval ? "line-through" : undefined}>{climateZoneShortLabel(zone) || "—"}</Text>
  )
}

function ClimateZonesForm({ jurisdiction }: IClimateZonesFormProps) {
  const { t } = useTranslation()

  const getDefaultValues = (): IFormValues => {
    const existing = [...jurisdiction.jurisdictionHeatingDegreeDays]
    if (existing.length === 0) {
      return {
        locations: [{ locationName: jurisdiction.qualifiedName, heatingDegreeDays: null }],
      }
    }

    return {
      locations: existing.map((row) => ({
        recordId: row.id,
        locationName: row.locationName,
        heatingDegreeDays: row.heatingDegreeDays,
      })),
    }
  }

  const { handleSubmit, control, formState, reset, register } = useForm<IFormValues>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "locations",
  })

  const watchedLocations = useWatch({ control, name: "locations" })

  const onRemove = (index: number) => {
    const field = fields[index]
    if (!field.recordId) {
      remove(index)
      return
    }
    update(index, { ...watchedLocations[index], _destroy: true })
  }

  const onRestore = (index: number) => {
    update(index, { ...watchedLocations[index], _destroy: false })
  }

  const onAdd = () => {
    append({ locationName: "", heatingDegreeDays: null })
  }

  const onSubmit = async (values: IFormValues) => {
    const attributes = values.locations
      .filter((row) => row.recordId || !row._destroy)
      .map((row) => ({
        id: row.recordId || undefined,
        locationName: row.locationName.trim(),
        heatingDegreeDays: row.heatingDegreeDays,
        ...(row._destroy ? { _destroy: true } : {}),
      }))

    const ok = await jurisdiction.update({
      jurisdictionHeatingDegreeDaysAttributes: attributes,
    })

    if (ok) {
      reset(getDefaultValues())
    }
  }

  const handleCancel = () => {
    reset(getDefaultValues())
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
      <VStack spacing={6} align="start" w="full">
        <Text>{t(`${czPrefix}.locationNameDescription`)}</Text>

        <Box w="full" borderWidth={1} borderColor="border.light" rounded="sm" overflow="hidden">
          <Table variant="simple" size="md">
            <Thead>
              <Tr bg="greys.grey03">
                <Th>{t(`${czPrefix}.tableHdd`)}</Th>
                <Th>{t(`${czPrefix}.tableClimateZone`)}</Th>
                <Th>{t(`${czPrefix}.tableLocationName`)}</Th>
                <Th w="100px" />
              </Tr>
            </Thead>
            <Tbody>
              {fields.map((field, index) => {
                const isMarkedForRemoval = !!watchedLocations?.[index]?._destroy
                const nameError = formState.errors.locations?.[index]?.locationName
                const hddError = formState.errors.locations?.[index]?.heatingDegreeDays
                const hddValue = watchedLocations?.[index]?.heatingDegreeDays ?? null

                return (
                  <Tr key={field.id} opacity={isMarkedForRemoval ? 0.65 : 1}>
                    <Td verticalAlign="top">
                      <FormControl isInvalid={!isMarkedForRemoval && !!hddError} maxW="180px">
                        <Controller
                          control={control}
                          name={`locations.${index}.heatingDegreeDays`}
                          rules={{
                            validate: (value) => {
                              if (watchedLocations?.[index]?._destroy) return true
                              if (value === null || value === undefined) {
                                return t(`${czPrefix}.validation.hddRequired`)
                              }
                              const num = Number(value)
                              if (isNaN(num) || num < HDD_MIN) return t(`${czPrefix}.validation.hddMin`)
                              if (num > HDD_MAX) return t(`${czPrefix}.validation.hddMax`)
                              return true
                            },
                          }}
                          render={({ field: { onChange, value } }) => (
                            <Input
                              type="number"
                              isDisabled={isMarkedForRemoval}
                              textDecoration={isMarkedForRemoval ? "line-through" : undefined}
                              value={value ?? ""}
                              onChange={(e) => {
                                const raw = e.target.value
                                onChange(raw === "" ? null : Number(raw))
                              }}
                            />
                          )}
                        />
                        {!isMarkedForRemoval && hddError && (
                          <FormErrorMessage fontSize="xs">{hddError.message}</FormErrorMessage>
                        )}
                      </FormControl>
                    </Td>
                    <Td verticalAlign="top" pt={5}>
                      <ClimateZoneCell hdd={hddValue} isMarkedForRemoval={isMarkedForRemoval} />
                    </Td>
                    <Td verticalAlign="top">
                      <FormControl isInvalid={!isMarkedForRemoval && !!nameError}>
                        <Input
                          isDisabled={isMarkedForRemoval}
                          textDecoration={isMarkedForRemoval ? "line-through" : undefined}
                          {...register(`locations.${index}.locationName`, {
                            validate: (value) => {
                              if (watchedLocations?.[index]?._destroy) return true
                              const trimmed = value.trim()
                              if (!trimmed) return t(`${czPrefix}.validation.locationNameRequired`)
                              const duplicates = (watchedLocations || []).filter(
                                (row, i) =>
                                  i !== index &&
                                  !row._destroy &&
                                  row.locationName.trim().toLowerCase() === trimmed.toLowerCase()
                              )
                              if (duplicates.length > 0) return t(`${czPrefix}.validation.locationNameUnique`)
                              return true
                            },
                          })}
                        />
                        {!isMarkedForRemoval && nameError && (
                          <FormErrorMessage fontSize="xs">{nameError.message}</FormErrorMessage>
                        )}
                      </FormControl>
                    </Td>
                    <Td verticalAlign="top" pt={3}>
                      {isMarkedForRemoval ? (
                        <Button size="sm" variant="link" onClick={() => onRestore(index)}>
                          {t("ui.undo")}
                        </Button>
                      ) : (
                        <IconButton
                          aria-label={t(`${czPrefix}.remove`)}
                          icon={<Trash size={16} />}
                          variant="ghost"
                          size="sm"
                          color="text.secondary"
                          onClick={() => onRemove(index)}
                        />
                      )}
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </Box>

        <Button variant="link" leftIcon={<Plus />} onClick={onAdd} fontWeight="normal">
          {t(`${czPrefix}.addAnotherLocation`)}
        </Button>

        {formState.isDirty && (
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

        <ClimateZonesForm jurisdiction={currentJurisdiction} />
      </VStack>
    </Container>
  )
})
