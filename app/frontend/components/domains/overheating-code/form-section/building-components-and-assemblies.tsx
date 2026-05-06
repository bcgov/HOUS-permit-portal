import {
  Box,
  Button,
  CloseButton,
  Field,
  Heading,
  HStack,
  Input,
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { ClauseBadge } from "./clause-badge"
import { FormFooter } from "./form-footer"

interface IBuildingComponentsFormData {
  componentsFacingOutside: { value: string }[]
  componentsFacingAdjacent: { value: string }[]
}

const ITEM_LABELS = ["A", "B", "C", "D", "E", "F"]
const MAX_ITEMS = ITEM_LABELS.length

export const BuildingComponentsAndAssemblies = observer(function BuildingComponentsAndAssemblies() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const toFieldArray = (arr: string[] | undefined) =>
    arr && arr.length > 0 ? arr.map((v) => ({ value: v })) : [{ value: "" }]

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<IBuildingComponentsFormData>({
    mode: "onChange",
    defaultValues: {
      componentsFacingOutside: toFieldArray(currentOverheatingCode?.componentsFacingOutside as unknown as string[]),
      componentsFacingAdjacent: toFieldArray(currentOverheatingCode?.componentsFacingAdjacent as unknown as string[]),
    },
  })

  const outsideFields = useFieldArray({ control, name: "componentsFacingOutside" })
  const adjacentFields = useFieldArray({ control, name: "componentsFacingAdjacent" })

  const onSubmit = async (data: IBuildingComponentsFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      componentsFacingOutside: data.componentsFacingOutside.map((f) => f.value).filter(Boolean),
      componentsFacingAdjacent: data.componentsFacingAdjacent.map((f) => f.value).filter(Boolean),
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.buildingComponents.title", "Building Components & Assemblies")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.buildingComponents.description",
          "Describe the building components and assemblies for the cooling zone, including those facing outside and those facing adjacent unconditioned spaces."
        )}
      </Text>
      <VStack gap={8} align="stretch">
        <Box>
          <Heading as="h3" size="md" mb={1}>
            {t("overheatingCode.sections.buildingComponents.facingOutsideHeading", "Facing Outside")}
            <ClauseBadge
              clause="§ 2.5.1–2.5.2"
              tooltip="2.5.1 Heat gain through opaque building assemblies between the cooling zone and the outside (HGcop) shall be calculated according to CSA F280 clause 6.2.1. 2.5.2 Heat gain through transparent and translucent building assemblies between the cooling zone and the outside (HGcot) shall be calculated according to CSA F280-12 clause 6.2.2.1 and 6.2.2.2."
            />
          </Heading>
          <Text fontSize="sm" color="text.secondary" mb={4}>
            {t(
              "overheatingCode.sections.buildingComponents.facingOutsideHint",
              "Walls, windows, doors, ceilings, and other assemblies that separate the cooling zone from the outdoors."
            )}
          </Text>

          <VStack gap={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {outsideFields.fields.map((field, index) => (
                <Field.Root key={field.id}>
                  <Field.Label fontSize="sm" fontWeight="semibold">
                    {t("overheatingCode.sections.buildingComponents.itemLabel", "Item {{label}}", {
                      label: ITEM_LABELS[index] || index + 1,
                    })}
                  </Field.Label>
                  <HStack>
                    <Input
                      {...register(`componentsFacingOutside.${index}.value`)}
                      placeholder={t(
                        "overheatingCode.sections.buildingComponents.itemPlaceholder",
                        'e.g. 2x6 @ 24" cc w/R24 Batt, Drywall, Brick'
                      )}
                    />
                    {outsideFields.fields.length > 1 && (
                      <CloseButton onClick={() => outsideFields.remove(index)} aria-label="Remove item" />
                    )}
                  </HStack>
                </Field.Root>
              ))}
            </SimpleGrid>

            {outsideFields.fields.length < MAX_ITEMS && (
              <Box>
                <Button
                  variant="plain"
                  colorPalette="blue"
                  size="sm"
                  onClick={() => outsideFields.append({ value: "" })}
                >
                  <Plus />
                  {t("overheatingCode.sections.buildingComponents.addItem", "Add Item")}
                </Button>
              </Box>
            )}
          </VStack>
        </Box>

        <Separator />

        <Box>
          <Heading as="h3" size="md" mb={1}>
            {t("overheatingCode.sections.buildingComponents.facingAdjacentHeading", "Facing Adjacent Spaces")}
            <ClauseBadge
              clause="§ 2.5.3–2.5.4"
              tooltip="2.5.3 Heat gain through opaque building assemblies between the cooling zone and adjacent unconditioned spaces (HGcaop) shall be calculated according to CSA F280-12 clause 6.2.1 except that the solar correction shall be set to zero. 2.5.4 Heat gain through transparent and translucent building assemblies between the cooling zone and adjacent unconditioned spaces (HGcat) shall be determined according to CSA F280-12 clause 6.2.2.1 except that the value for 'Solar' shall be set to zero."
            />
          </Heading>
          <Text fontSize="sm" color="text.secondary" mb={4}>
            {t(
              "overheatingCode.sections.buildingComponents.facingAdjacentHint",
              "Walls, floors, ceilings, and other assemblies that separate the cooling zone from adjacent unconditioned spaces."
            )}
          </Text>

          <VStack gap={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {adjacentFields.fields.map((field, index) => (
                <Field.Root key={field.id}>
                  <Field.Label fontSize="sm" fontWeight="semibold">
                    {t("overheatingCode.sections.buildingComponents.itemLabel", "Item {{label}}", {
                      label: ITEM_LABELS[index] || index + 1,
                    })}
                  </Field.Label>
                  <HStack>
                    <Input
                      {...register(`componentsFacingAdjacent.${index}.value`)}
                      placeholder={t(
                        "overheatingCode.sections.buildingComponents.itemPlaceholder",
                        'e.g. 2x6 @ 24" cc w/R24 Batt, Drywall, Brick'
                      )}
                    />
                    {adjacentFields.fields.length > 1 && (
                      <CloseButton onClick={() => adjacentFields.remove(index)} aria-label="Remove item" />
                    )}
                  </HStack>
                </Field.Root>
              ))}
            </SimpleGrid>

            {adjacentFields.fields.length < MAX_ITEMS && (
              <Box>
                <Button
                  variant="plain"
                  colorPalette="blue"
                  size="sm"
                  onClick={() => adjacentFields.append({ value: "" })}
                >
                  <Plus />
                  {t("overheatingCode.sections.buildingComponents.addItem", "Add Item")}
                </Button>
              </Box>
            )}
          </VStack>
        </Box>
      </VStack>
      <FormFooter<IBuildingComponentsFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
    </Box>
  )
})
