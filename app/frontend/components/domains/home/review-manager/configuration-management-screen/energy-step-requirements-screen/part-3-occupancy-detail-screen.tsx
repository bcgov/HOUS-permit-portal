import { InputGroup } from "@/components/ui/input-group"
import {
  Box,
  Button,
  Container,
  Field,
  Flex,
  Heading,
  HStack,
  Input,
  InputElement,
  Popover,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react"
import { CaretDown, CaretLeft, Plus, Trash } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { getPart3OccupancyByKey } from "../../../../../../constants/part3-occupancy-requirements"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { IPart3Occupancy } from "../../../../../../types/types"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { i18nPrefix } from "./i18n-prefix"

type TDetailPrefix = `${typeof i18nPrefix}.occupancyDetail`
const d: TDetailPrefix = `${i18nPrefix}.occupancyDetail`

type TFunction = ReturnType<typeof useTranslation>["t"]

function formatStepLabel(t: TFunction, step: number): string {
  // @ts-ignore
  return t(`${d}.stepLabel`, { step })
}

function formatZeroCarbonLabel(t: TFunction, level: number | null): string {
  // @ts-ignore
  if (level === null) return t(`${d}.notApplicable`)
  return t(`${d}.zeroCarbonELLabel`, { level })
}

function formatStepRange(t: TFunction, steps: number[]): string {
  // @ts-ignore
  if (steps.length === 0) return t(`${d}.notApplicable`)
  if (steps.length === 1) return t(`${d}.stepRangeOnly`, { step: steps[0] })
  return t(`${d}.stepRangeFromTo`, { from: steps[0], to: steps[steps.length - 1] })
}

function formatZeroCarbonRange(t: TFunction, levels: number[]): string {
  // @ts-ignore
  if (levels.length === 0) return t(`${d}.notApplicable`)
  if (levels.length === 1) return t(`${d}.zeroCarbonRangeOnly`, { level: levels[0] })
  return t(`${d}.zeroCarbonRangeFromTo`, { from: levels[0], to: levels[levels.length - 1] })
}

// --- Select components ---

interface IStepSelectProps {
  options: number[]
  value: number | undefined
  onChange?: (val: number) => void
  onValueChange?: (val: number) => void
  isDisabled?: boolean
  formatLabel: (val: number) => string
  placeholder?: string
}

function StepSelect({
  options,
  value,
  onChange,
  onValueChange,
  isDisabled,
  formatLabel,
  placeholder,
}: IStepSelectProps) {
  const { t } = useTranslation()
  const handleChange = onValueChange ?? onChange ?? (() => undefined)

  return (
    <Popover.Root
      positioning={{
        placement: "bottom-end",
      }}
    >
      <Popover.Context>
        {({ setOpen: setOpen }) => {
          const onClose = () => setOpen(false)

          return (
            <>
              <Popover.Trigger asChild>
                <InputGroup pointerEvents={isDisabled ? "none" : "auto"}>
                  <Input
                    bg="white"
                    cursor="pointer"
                    alignItems="center"
                    borderColor="gray.200"
                    borderWidth={1}
                    rounded="base"
                    shadow="base"
                    disabled={isDisabled}
                    asChild
                  >
                    <Flex>{value !== undefined ? formatLabel(value) : (placeholder ?? t("ui.selectPlaceholder"))}</Flex>
                  </Input>
                  <InputElement placement="end" children={<CaretDown color="gray.300" />} />
                </InputGroup>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content>
                    <VStack align="start" gap={0}>
                      {options.map((opt) => (
                        <Flex
                          key={opt}
                          onClick={() => {
                            handleChange(opt)
                            onClose()
                          }}
                          px={2}
                          py={1.5}
                          w="full"
                          cursor="pointer"
                          _hover={{ bg: "hover.blue" }}
                        >
                          {formatLabel(opt)}
                        </Flex>
                      ))}
                    </VStack>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </>
          )
        }}
      </Popover.Context>
    </Popover.Root>
  )
}

// --- Section components ---

function BaselineRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex gap={4}>
      <Text fontWeight="bold" whiteSpace="nowrap">
        {label}
      </Text>
      <Text>{value}</Text>
    </Flex>
  )
}

function ProvinceBaseline({ occupancy }: { occupancy: IPart3Occupancy }) {
  const { t } = useTranslation()

  return (
    <Box w="full">
      <Heading as="h3" fontSize="lg" mb={4}>
        {t(`${d}.provincialBaseline`)}
      </Heading>
      <Box borderWidth={1} borderColor="border.light" rounded="sm" p={6}>
        <Text mb={4}>{t(`${d}.provinceHasEstablished`)}</Text>
        <VStack align="start" gap={1} mb={4}>
          <BaselineRow
            label={t(`${d}.energyStepCodeLabel`)}
            value={formatStepLabel(t, occupancy.provincialBaseline.energyStep)}
          />
          <BaselineRow
            label={t(`${d}.zeroCarbonStepCodeLabel`)}
            value={formatZeroCarbonLabel(t, occupancy.provincialBaseline.zeroCarbonLevel)}
          />
        </VStack>
        <Text fontSize="sm" color="text.secondary">
          {t(`${d}.baselineDisclaimer`)}
        </Text>
      </Box>
    </Box>
  )
}

function ApplicableStepRanges({ occupancy }: { occupancy: IPart3Occupancy }) {
  const { t } = useTranslation()

  return (
    <Box w="full">
      <Heading as="h3" fontSize="lg" mb={4}>
        {t(`${d}.applicableStepRanges`)}
      </Heading>
      {occupancy.isConfigurable ? (
        <Box borderWidth={1} borderColor="border.light" rounded="sm" p={6}>
          <HStack gap={16} align="start">
            <Box>
              <Text fontWeight="bold" mb={1}>
                {t(`${d}.energyStepCodeHeader`)}
              </Text>
              <Text>{formatStepRange(t, occupancy.allowedEnergySteps)}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={1}>
                {t(`${d}.zeroCarbonStepCodeHeader`)}
              </Text>
              <Text>{formatZeroCarbonRange(t, occupancy.allowedZeroCarbonLevels)}</Text>
            </Box>
          </HStack>
        </Box>
      ) : (
        <Box bg="semantic.warningLight" borderWidth={1} borderColor="semantic.warning" rounded="sm" p={4}>
          <Text>{t(`${d}.notApplicableExplanation`)}</Text>
        </Box>
      )}
    </Box>
  )
}

function ReadOnlyPathwayField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontSize="sm" mb={1}>
        {label}
      </Text>
      <Box bg="greys.grey03" borderWidth={1} borderColor="border.light" rounded="sm" px={3} py={2}>
        <Text color="text.secondary">{value}</Text>
      </Box>
    </Box>
  )
}

// --- Configurable pathways form ---

interface ICompliancePathway {
  recordId?: string
  energyStep: number | undefined
  zeroCarbonLevel: number | undefined
}

interface IFormValues {
  pathways: ICompliancePathway[]
}

function OrDivider() {
  const { t } = useTranslation()
  return (
    <Flex align="center" w="full" my={4}>
      <Box flex={1} borderBottomWidth={1} borderColor="border.light" />
      <Text px={4} fontSize="sm" textTransform="uppercase" color="greys.grey01" fontStyle="italic">
        {t("ui.or")}
      </Text>
      <Box flex={1} borderBottomWidth={1} borderColor="border.light" />
    </Flex>
  )
}

interface IConfigurableProps {
  occupancy: IPart3Occupancy
  jurisdiction: IJurisdiction
}

function ConfigurableCompliancePathways({ occupancy, jurisdiction }: IConfigurableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const existingSteps = jurisdiction.part3RequiredStepsForOccupancy(occupancy.key)

  const getDefaultValues = (): IFormValues => ({
    pathways: existingSteps.map((s) => ({
      recordId: s.id,
      energyStep: s.energyStepRequired,
      zeroCarbonLevel: s.zeroCarbonStepRequired ?? undefined,
    })),
  })

  const { handleSubmit, control, formState, reset } = useForm<IFormValues>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pathways",
  })

  const [removedRecordIds, setRemovedRecordIds] = React.useState<string[]>([])

  const onRemove = (index: number) => {
    const field = fields[index]
    if (field.recordId) {
      setRemovedRecordIds((prev) => [...prev, field.recordId])
    }
    remove(index)
  }

  const onSubmit = async (values: IFormValues) => {
    const attributes = [
      ...values.pathways.map((p) => ({
        id: p.recordId || undefined,
        occupancyKey: occupancy.key,
        energyStepRequired: p.energyStep,
        zeroCarbonStepRequired: p.zeroCarbonLevel,
      })),
      ...removedRecordIds.map((id) => ({ id, _destroy: true })),
    ]

    const ok = await jurisdiction.update({
      part3OccupancyRequiredStepsAttributes: attributes,
    })

    if (ok) {
      setRemovedRecordIds([])
      reset(getDefaultValues())
      navigate(-1)
    }
  }

  const onAdd = () => {
    append({ energyStep: undefined, zeroCarbonLevel: undefined })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
      <VStack gap={6} align="start" w="full">
        <Box w="full">
          <Heading as="h3" fontSize="lg" mb={2}>
            {t(`${d}.localCompliancePathways`)}
          </Heading>
          <Text mb={4} color="text.secondary">
            {t(`${d}.configurablePathwayDescription`)}
          </Text>

          <VStack gap={0} w="full" align="stretch">
            {fields.map((field, index) => (
              <React.Fragment key={field.id}>
                {index > 0 && <OrDivider />}
                <Box borderWidth={1} borderColor="border.light" rounded="sm" p={6}>
                  <Flex align="end" gap={6}>
                    <Box>
                      <Field.Root>
                        <Field.Label fontSize="sm">{t(`${d}.energyStepCodeLevel`)}</Field.Label>
                        <Controller
                          control={control}
                          name={`pathways.${index}.energyStep`}
                          rules={{ required: true }}
                          render={({ field: { onChange, value } }) => (
                            <StepSelect
                              options={occupancy.allowedEnergySteps}
                              value={value}
                              onValueChange={onChange}
                              formatLabel={(v) => String(v)}
                            />
                          )}
                        />
                      </Field.Root>
                    </Box>
                    <Box>
                      <Field.Root>
                        <Field.Label fontSize="sm">{t(`${d}.zeroCarbonStepCodeLevel`)}</Field.Label>
                        <Controller
                          control={control}
                          name={`pathways.${index}.zeroCarbonLevel`}
                          rules={{ required: true }}
                          render={({ field: { onChange, value } }) => (
                            <StepSelect
                              options={occupancy.allowedZeroCarbonLevels}
                              value={value}
                              onValueChange={onChange}
                              formatLabel={(v) => `EL-${v}`}
                            />
                          )}
                        />
                      </Field.Root>
                    </Box>
                    <Box flex={1} />
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => onRemove(index)}
                      color="text.secondary"
                      fontWeight="normal"
                      mb={1}
                    >
                      <Trash />
                      {t(`${d}.remove`)}
                    </Button>
                  </Flex>
                </Box>
              </React.Fragment>
            ))}
          </VStack>

          <Button variant="outline" size="sm" onClick={onAdd} mt={4}>
            <Plus />
            {t(`${d}.addComplianceOption`)}
          </Button>
        </Box>

        <HStack gap={3}>
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t(`${d}.cancel`)}
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={formState.isSubmitting}
            disabled={formState.isSubmitting || !formState.isValid}
          >
            {t(`${d}.save`)}
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}

function NonConfigurableCompliancePathways({ occupancy }: { occupancy: IPart3Occupancy }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <Box w="full">
        <Heading as="h3" fontSize="lg" mb={2}>
          {t(`${d}.localCompliancePathways`)}
        </Heading>
        <Text mb={4} color="text.secondary">
          {t(`${d}.pathwayDescription`)}
        </Text>
        <Box borderWidth={1} borderColor="border.light" rounded="sm" p={6}>
          <HStack gap={6} mb={4} align="start">
            <ReadOnlyPathwayField
              label={t(`${d}.energyStepCodeLevel`)}
              value={formatStepLabel(t, occupancy.provincialBaseline.energyStep)}
            />
            <ReadOnlyPathwayField
              label={t(`${d}.zeroCarbonStepCodeLevel`)}
              value={formatZeroCarbonLabel(t, occupancy.provincialBaseline.zeroCarbonLevel)}
            />
          </HStack>
          <Text fontSize="sm" color="text.secondary">
            {t(`${d}.cannotBeChanged`)}
          </Text>
        </Box>
      </Box>

      <Button variant="outline" onClick={() => navigate(-1)}>
        {t(`${d}.cancel`)}
      </Button>
    </>
  )
}

// --- Main screen ---

export const Part3OccupancyDetailScreen = observer(function Part3OccupancyDetailScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { occupancyKey } = useParams()
  const occupancy = getPart3OccupancyByKey(occupancyKey)
  const { currentJurisdiction, error } = useJurisdiction()

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  if (!occupancy) {
    return (
      <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
        <Text>{t(`${d}.notFound`)}</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
      <VStack gap={6} align="start" w="full">
        <Button variant="plain" onClick={() => navigate(-1)} textDecoration="none">
          <CaretLeft size={20} />
          {t("ui.back")}
        </Button>

        <Heading mb={0} fontSize="3xl">
          {occupancy.name}
        </Heading>

        <ProvinceBaseline occupancy={occupancy} />
        <ApplicableStepRanges occupancy={occupancy} />

        {occupancy.isConfigurable ? (
          <ConfigurableCompliancePathways occupancy={occupancy} jurisdiction={currentJurisdiction} />
        ) : (
          <NonConfigurableCompliancePathways occupancy={occupancy} />
        )}
      </VStack>
    </Container>
  )
})
