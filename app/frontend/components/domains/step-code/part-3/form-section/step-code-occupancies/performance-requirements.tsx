import { RadioGroup } from "@/components/ui/radio"
import { Field, Flex, Grid, Stack, Text } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus } from "../../../../../../types/enums"
import { IStepCodeOccupancy } from "../../../../../../types/types"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { RouterLink } from "../../../../../shared/navigation/router-link"
import { EnergyStepSelect } from "../../../../home/review-manager/configuration-management-screen/energy-step-requirements-screen/energy-step-editable-block/energy-step-select"
import { ZeroCarbonStepSelect } from "../../../../home/review-manager/configuration-management-screen/energy-step-requirements-screen/energy-step-editable-block/zero-carbon-step-select"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"
import { Part3FormFooter } from "../shared/form-footer"
import { SectionHeading } from "../shared/section-heading"

const i18nPrefix = "stepCode.part3.stepCodePerformanceRequirements"
const oci18nPrefix = "stepCode.part3.stepCodeOccupancyKeys"

export const StepCodeOccupanciesPerformanceRequirements = observer(
  function Part3StepCodeFormStepCodeOccupanciesStepCodeOccupanciesPerformanceRequirements() {
    const { checklist } = usePart3StepCode()

    const location = useLocation()

    const formMethods = useForm({
      mode: "onSubmit",
      defaultValues: {
        stepCodeOccupanciesAttributes: checklist.stepCodeOccupancies.map((oc) => ({
          id: oc.id,
          key: oc.key,
          modelledFloorArea: parseFloat(oc.modelledFloorArea),
          energyStepRequired: oc.energyStepRequired,
          zeroCarbonStepRequired: oc.zeroCarbonStepRequired,
          requirementSource: oc.requirementSource,
        })),
      },
    })

    const { handleSubmit, formState, control, reset } = formMethods

    const { fields } = useFieldArray({
      control,
      name: "stepCodeOccupanciesAttributes",
    })
    const stepCodeOccupanciesPath = "step-code-occupancies"
    const { isSubmitting, isValid, isSubmitted, errors } = formState

    const onSubmit = async (values) => {
      if (!checklist) return
      const updated = await checklist.update(values)
      if (!updated) throw new Error("Save failed")
      await checklist.completeSection("stepCodePerformanceRequirements")
    }

    useEffect(() => {
      if (isSubmitted) {
        reset(undefined, { keepDirtyValues: true, keepErrors: true })
      }
    }, [isValid])

    return (
      <>
        <Flex direction="column" gap={2} pb={6}>
          {!isValid && isSubmitted && (
            <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
          )}
          <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
          <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text>
        </Flex>
        <FormProvider {...formMethods}>
          <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
            {fields.map((field, idx) => (
              <OccupancyEnergyStep field={field} idx={idx} />
            ))}

            <Grid
              w="full"
              templateColumns={`auto repeat(2, minmax(auto, 240px))`}
              borderWidth={1}
              borderTopWidth={0}
              borderBottomWidth={0}
              borderColor="borders.light"
            >
              <GridColumnHeader>
                <Text>{t(`${i18nPrefix}.occupanciesTable.headers.occupancy`)}</Text>
              </GridColumnHeader>
              <GridColumnHeader>
                <Text>
                  <Trans
                    i18nKey={`${i18nPrefix}.occupanciesTable.headers.modelledFloorArea`}
                    components={{ sup: <sup /> }}
                  />
                </Text>
              </GridColumnHeader>
              <GridColumnHeader>
                <Text>{t(`${i18nPrefix}.occupanciesTable.headers.ghg`)}</Text>
              </GridColumnHeader>

              {fields.map((f, idx) => (
                <OccupancyRow field={f} idx={idx} />
              ))}
            </Grid>
            <Text>
              <Trans
                i18nKey={`${i18nPrefix}.occupanciesTable.hint`}
                components={{
                  stepCodeOccupanciesLink: (
                    <RouterLink
                      to={`${location.pathname.replace("step-code-performance-requirements", stepCodeOccupanciesPath)}`}
                    />
                  ),
                }}
              />
            </Text>
            <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
          </Flex>
        </FormProvider>
      </>
    )
  }
)
interface IOccupancyProps {
  field: IStepCodeOccupancy
  idx: number
}

const OccupancyEnergyStep = observer(function OccupancyEnergyStep({ field, idx }: IOccupancyProps) {
  const { register, control, formState } = useFormContext()
  const { errors } = formState

  const [isRelevant, setIsRelevant] = useState(field.energyStepRequired ? "yes" : "no")

  return (
    <>
      <Field.Root>
        <Field.Label>
          {t(`${i18nPrefix}.stepCodeRequirement.isCustom.label`, { occupancyName: t(`${oci18nPrefix}.${field.key}`) })}
        </Field.Label>
        <Field.HelperText mb={1} mt={0}>
          {t(`${i18nPrefix}.stepCodeRequirement.isCustom.hint`)}
        </Field.HelperText>
        <RadioGroup.Root onValueChange={setIsRelevant} value={isRelevant}>
          <Stack gap={5} direction="row">
            <RadioGroup.Item variant="binary" value={"yes"}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{t("ui.yes")}</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item variant="binary" value={"no"}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{t("ui.no")}</RadioGroup.ItemText>
            </RadioGroup.Item>
          </Stack>
        </RadioGroup.Root>
      </Field.Root>
      {isRelevant == "yes" && (
        <>
          <Field.Root maxW="200px">
            <Field.Label>
              {t(`${i18nPrefix}.stepCodeRequirement.energyStepRequired.label`, {
                occupancyName: t(`${oci18nPrefix}.${field.key}`),
              })}
            </Field.Label>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name={`stepCodeOccupanciesAttributes.${idx}.energyStepRequired`} />
            </Field.HelperText>
            <Controller
              control={control}
              rules={{ required: t(`${i18nPrefix}.stepCodeRequirement.energyStepRequired.error`) }}
              name={`stepCodeOccupanciesAttributes.${idx}.energyStepRequired`}
              render={({ field: { onChange, value } }) => {
                return <EnergyStepSelect onChange={onChange} value={value} />
              }}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>
              {t(`${i18nPrefix}.stepCodeRequirement.source.label`, {
                occupancyName: t(`${oci18nPrefix}.${field.key}`),
              })}
            </Field.Label>
            <Field.HelperText mb={1} mt={0}>
              {t(`${i18nPrefix}.stepCodeRequirement.source.hint`)}
            </Field.HelperText>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name={`stepCodeOccupanciesAttributes.${idx}.requirementSource`} />
            </Field.HelperText>
            <Input
              textAlign="left"
              maxW={"430px"}
              {...register(`stepCodeOccupanciesAttributes.${idx}.requirementSource`, {
                required: t(`${i18nPrefix}.stepCodeRequirement.source.error`),
              })}
            />
          </Field.Root>
        </>
      )}
    </>
  )
})

const OccupancyRow = observer(function OccupancyRow({ field, idx }: IOccupancyProps) {
  const { register, control, formState } = useFormContext()
  const { errors } = formState

  return (
    <>
      <GridData px={3}>
        <Input disabled value={t(`stepCode.part3.stepCodeOccupancyKeys.${field.key}`)} />
      </GridData>
      <GridData>
        <Field.Root>
          <Input
            type="number"
            step="any"
            textAlign="center"
            {...register(`stepCodeOccupanciesAttributes.${idx}.modelledFloorArea`, {
              required: t(`${i18nPrefix}.modelledFloorArea.error`, {
                occupancyName: t(`${oci18nPrefix}.${field.key}`),
              }),
            })}
          />
          <Field.HelperText color="semantic.error">
            <ErrorMessage errors={errors} name={`stepCodeOccupanciesAttributes.${idx}.modelledFloorArea`} />
          </Field.HelperText>
        </Field.Root>
      </GridData>
      <GridData>
        <Field.Root>
          <Controller
            control={control}
            rules={{
              validate: (value, formValues) =>
                value === undefined
                  ? t(`${i18nPrefix}.zeroCarbonStepRequired.error`, {
                      occupancyName: t(`${oci18nPrefix}.${field.key}`),
                    })
                  : true,
            }}
            name={`stepCodeOccupanciesAttributes.${idx}.zeroCarbonStepRequired`}
            render={({ field: { onChange, value } }) => {
              return <ZeroCarbonStepSelect onChange={onChange} value={value} allowNull />
            }}
          />
          <Field.HelperText color="semantic.error">
            <ErrorMessage errors={errors} name={`stepCodeOccupanciesAttributes.${idx}.zeroCarbonStepRequired`} />
          </Field.HelperText>
        </Field.Root>
      </GridData>
    </>
  )
})
