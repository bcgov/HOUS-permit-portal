import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Plus, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

const STYLE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const CATEGORIES = [
  "aboveGradeWalls",
  "belowGradeWalls",
  "ceilings",
  "floorsOnSoil",
  "windows",
  "exposedFloors",
  "skylights",
  "doors",
] as const

type CategoryKey = (typeof CATEGORIES)[number]

type CategoryArrayField = { value: string }

type IBuildingEnvelopeFormData = {
  [K in CategoryKey]: CategoryArrayField[]
}

function toFieldArray(arr: string[]): CategoryArrayField[] {
  return arr.length > 0 ? arr.map((v) => ({ value: v })) : []
}

function fromFieldArray(arr: CategoryArrayField[]): string[] {
  return arr.map((f) => f.value).filter((v) => v.trim() !== "")
}

interface ICategoryCardProps {
  categoryKey: CategoryKey
  fields: { id: string; value: string }[]
  register: any
  append: (value: CategoryArrayField) => void
  remove: (index: number) => void
  t: (key: string, fallback: string) => string
}

function CategoryCard({ categoryKey, fields, register, append, remove, t }: ICategoryCardProps) {
  return (
    <Box border="1px solid" borderColor="border.light" borderRadius="md" p={4}>
      <Heading as="h4" size="sm" mb={3}>
        {t(`overheatingCode.sections.buildingEnvelope.categories.${categoryKey}`, categoryKey)}
      </Heading>
      <VStack spacing={3} align="stretch">
        {fields.map((field, index) => (
          <FormControl key={field.id}>
            <HStack>
              <FormLabel mb={0} minW="60px" fontSize="sm" fontWeight="semibold">
                {t("overheatingCode.sections.buildingEnvelope.styleLabel", "Style")} {STYLE_LETTERS[index]}:
              </FormLabel>
              <Input
                size="sm"
                {...register(`${categoryKey}.${index}.value`)}
                placeholder={t(
                  `overheatingCode.sections.buildingEnvelope.placeholders.${categoryKey}`,
                  "Describe construction assembly..."
                )}
              />
              <IconButton
                aria-label={t("overheatingCode.sections.buildingEnvelope.removeStyle", "Remove style")}
                icon={<X />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => remove(index)}
              />
            </HStack>
          </FormControl>
        ))}
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<Plus />}
          onClick={() => append({ value: "" })}
          alignSelf="flex-start"
        >
          {t("overheatingCode.sections.buildingEnvelope.addStyle", "Add Style")}
        </Button>
      </VStack>
    </Box>
  )
}

export const BuildingEnvelope = observer(function BuildingEnvelope() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<IBuildingEnvelopeFormData>({
    defaultValues: {
      aboveGradeWalls: toFieldArray(currentOverheatingCode?.aboveGradeWalls?.slice() ?? []),
      belowGradeWalls: toFieldArray(currentOverheatingCode?.belowGradeWalls?.slice() ?? []),
      ceilings: toFieldArray(currentOverheatingCode?.ceilings?.slice() ?? []),
      floorsOnSoil: toFieldArray(currentOverheatingCode?.floorsOnSoil?.slice() ?? []),
      windows: toFieldArray(currentOverheatingCode?.windows?.slice() ?? []),
      exposedFloors: toFieldArray(currentOverheatingCode?.exposedFloors?.slice() ?? []),
      skylights: toFieldArray(currentOverheatingCode?.skylights?.slice() ?? []),
      doors: toFieldArray(currentOverheatingCode?.doors?.slice() ?? []),
    },
  })

  const aboveGradeWalls = useFieldArray({ control, name: "aboveGradeWalls" })
  const belowGradeWalls = useFieldArray({ control, name: "belowGradeWalls" })
  const ceilings = useFieldArray({ control, name: "ceilings" })
  const floorsOnSoil = useFieldArray({ control, name: "floorsOnSoil" })
  const windows = useFieldArray({ control, name: "windows" })
  const exposedFloors = useFieldArray({ control, name: "exposedFloors" })
  const skylights = useFieldArray({ control, name: "skylights" })
  const doors = useFieldArray({ control, name: "doors" })

  const fieldArrays: Record<CategoryKey, ReturnType<typeof useFieldArray>> = {
    aboveGradeWalls,
    belowGradeWalls,
    ceilings,
    floorsOnSoil,
    windows,
    exposedFloors,
    skylights,
    doors,
  }

  const onSubmit = async (data: IBuildingEnvelopeFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      aboveGradeWalls: fromFieldArray(data.aboveGradeWalls),
      belowGradeWalls: fromFieldArray(data.belowGradeWalls),
      ceilings: fromFieldArray(data.ceilings),
      floorsOnSoil: fromFieldArray(data.floorsOnSoil),
      windows: fromFieldArray(data.windows),
      exposedFloors: fromFieldArray(data.exposedFloors),
      skylights: fromFieldArray(data.skylights),
      doors: fromFieldArray(data.doors),
    })
  }

  const categoryPairs: [CategoryKey, CategoryKey][] = [
    ["aboveGradeWalls", "belowGradeWalls"],
    ["ceilings", "floorsOnSoil"],
    ["windows", "exposedFloors"],
    ["skylights", "doors"],
  ]

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.buildingEnvelope.title", "Building Envelope")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.buildingEnvelope.description",
          "Describe the construction assemblies for each building component. Add multiple styles if the building uses different assemblies for the same component type."
        )}
      </Text>

      <VStack spacing={6} align="stretch">
        {categoryPairs.map(([left, right]) => (
          <SimpleGrid key={`${left}-${right}`} columns={{ base: 1, md: 2 }} spacing={6}>
            <CategoryCard
              categoryKey={left}
              fields={fieldArrays[left].fields as any}
              register={register}
              append={fieldArrays[left].append}
              remove={fieldArrays[left].remove}
              t={t}
            />
            <CategoryCard
              categoryKey={right}
              fields={fieldArrays[right].fields as any}
              register={register}
              append={fieldArrays[right].append}
              remove={fieldArrays[right].remove}
              t={t}
            />
          </SimpleGrid>
        ))}
      </VStack>

      <FormFooter<IBuildingEnvelopeFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
