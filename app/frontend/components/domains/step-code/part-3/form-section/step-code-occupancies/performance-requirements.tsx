import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { IStepCodeOccupancy } from "../../../../../../types/types"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { EnergyStepSelect } from "../../../../home/review-manager/configuration-management-screen/energy-step-requirements-screen/energy-step-editable-block/energy-step-select"
import { ZeroCarbonStepSelect } from "../../../../home/review-manager/configuration-management-screen/energy-step-requirements-screen/energy-step-editable-block/zero-carbon-step-select"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"
import { SectionHeading } from "../shared/section-heading"

const i18nPrefix = "stepCode.part3.stepCodePerformanceRequirements"
const oci18nPrefix = "stepCode.part3.stepCodeOccupancyKeys"

export const StepCodeOccupanciesPerformanceRequirements = observer(
  function Part3StepCodeFormStepCodeOccupanciesStepCodeOccupanciesPerformanceRequirements() {
    const { checklist } = usePart3StepCode()

    const navigate = useNavigate()
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

    const { isSubmitting, isValid, isSubmitted, errors } = formState

    const onSubmit = async (values) => {
      if (!isValid) return

      const updated = await checklist.update(values)
      if (updated) {
        await checklist.completeSection("stepCodePerformanceRequirements")
      } else {
        return
      }

      navigate(location.pathname.replace("step-code-performance-requirements", "modelled-outputs"))
    }

    useEffect(() => {
      if (isSubmitted) {
        // reset form state to prevent message box from showing again until form is resubmitted
        reset(undefined, { keepDirtyValues: true, keepErrors: true })
      }
    }, [isValid])

    return (
      <>
        <Flex direction="column" gap={2} pb={6}>
          {!isValid && isSubmitted && <CustomMessageBox title={t("stepCode.part3.errorTitle")} status="error" />}
          <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
          <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text>
        </Flex>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
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

              <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
                {t("stepCode.part3.cta")}
              </Button>
            </Flex>
          </form>
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
      <FormControl>
        <FormLabel>
          {t(`${i18nPrefix}.stepCodeRequirement.isCustom.label`, { occupancyName: t(`${oci18nPrefix}.${field.key}`) })}
        </FormLabel>
        <FormHelperText mb={1} mt={0}>
          {t(`${i18nPrefix}.stepCodeRequirement.isCustom.hint`)}
        </FormHelperText>
        <RadioGroup onChange={setIsRelevant} value={isRelevant}>
          <Stack spacing={5} direction="row">
            <Radio variant="binary" value={"yes"}>
              {t("ui.yes")}
            </Radio>
            <Radio variant="binary" value={"no"}>
              {t("ui.no")}
            </Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
      {isRelevant == "yes" && (
        <>
          <FormControl maxW="200px">
            <FormLabel>
              {t(`${i18nPrefix}.stepCodeRequirement.energyStepRequired.label`, {
                occupancyName: t(`${oci18nPrefix}.${field.key}`),
              })}
            </FormLabel>
            <FormHelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name={`stepCodeOccupanciesAttributes.${idx}.energyStepRequired`} />
            </FormHelperText>
            <Controller
              control={control}
              rules={{ required: t(`${i18nPrefix}.stepCodeRequirement.energyStepRequired.error`) }}
              name={`stepCodeOccupanciesAttributes.${idx}.energyStepRequired`}
              render={({ field: { onChange, value } }) => {
                return <EnergyStepSelect onChange={onChange} value={value} />
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>
              {t(`${i18nPrefix}.stepCodeRequirement.source.label`, {
                occupancyName: t(`${oci18nPrefix}.${field.key}`),
              })}
            </FormLabel>
            <FormHelperText mb={1} mt={0}>
              {t(`${i18nPrefix}.stepCodeRequirement.source.hint`)}
            </FormHelperText>
            <FormHelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name={`stepCodeOccupanciesAttributes.${idx}.requirementSource`} />
            </FormHelperText>
            <Input
              textAlign="left"
              maxW={"430px"}
              {...register(`stepCodeOccupanciesAttributes.${idx}.requirementSource`, {
                required: t(`${i18nPrefix}.stepCodeRequirement.source.error`),
              })}
            />
          </FormControl>
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
        <Input isDisabled value={t(`stepCode.part3.stepCodeOccupancyKeys.${field.key}`)} />
      </GridData>
      <GridData>
        <FormControl>
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
          <FormHelperText color="semantic.error">
            <ErrorMessage errors={errors} name={`stepCodeOccupanciesAttributes.${idx}.modelledFloorArea`} />
          </FormHelperText>
        </FormControl>
      </GridData>
      <GridData>
        <FormControl>
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
              console.log("*** value", value)
              return <ZeroCarbonStepSelect onChange={onChange} value={value} allowNull />
            }}
          />
          <FormHelperText color="semantic.error">
            <ErrorMessage errors={errors} name={`stepCodeOccupanciesAttributes.${idx}.zeroCarbonStepRequired`} />
          </FormHelperText>
        </FormControl>
      </GridData>
    </>
  )
})
