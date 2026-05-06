import { InputGroup } from "@/components/ui/input-group"
import { Center, Field, Flex, FormControlProps, Input, InputElement, Link, NativeSelect, Text } from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { IOption } from "../../../../../types/types"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { DatePickerFormControl } from "../../../../shared/form/input-form-control"
import { SitesSelect } from "../../../../shared/select/selectors/sites-select"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

interface IProjectDetailsForm {
  fullAddress?: string
  referenceNumber?: string
  permitDate?: string
  phase?: string
  site?: IOption
  jurisdictionId?: string
}

export const ProjectDetails = observer(function Part3StepCodeFormProjectDetails() {
  const i18nPrefix = "stepCode.part3.projectDetails"
  const { permitApplicationId } = useParams()
  const { checklist, currentStepCode } = usePart3StepCode()

  const getDefaultValues = (): IProjectDetailsForm => {
    return {
      fullAddress: currentStepCode?.fullAddress || "",
      referenceNumber: currentStepCode?.referenceNumber || "",
      permitDate: currentStepCode?.permitDate || "",
      phase: currentStepCode?.phase || "",
      jurisdictionId: currentStepCode?.jurisdiction?.id || "",
    }
  }

  const formMethods = useForm<IProjectDetailsForm>({
    defaultValues: getDefaultValues(),
  })

  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = formMethods

  const [editingAddress, setEditingAddress] = useState<boolean>(!Boolean(currentStepCode?.fullAddress))

  useEffect(() => {
    if (checklist && currentStepCode) {
      reset(getDefaultValues())
      setEditingAddress(!Boolean(currentStepCode?.fullAddress))
    }
  }, [checklist, currentStepCode, reset])

  const onSubmit = async (data: IProjectDetailsForm) => {
    if (!checklist || !currentStepCode) return

    if (editable) {
      await (currentStepCode as any).update({
        fullAddress: data.fullAddress,
        referenceNumber: data.referenceNumber,
        permitDate: data.permitDate,
        phase: data.phase,
        jurisdictionId: data.jurisdictionId,
      })
    }
    const sectionCompleteSucceeded = await checklist.completeSection("projectDetails")
    if (!sectionCompleteSucceeded) throw new Error("Save failed")
  }

  if (!checklist || !currentStepCode) {
    return (
      <Center p={10}>
        <SharedSpinner />
      </Center>
    )
  }

  const editable = R.isNil(permitApplicationId)

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
        <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text>
      </Flex>
      <FormProvider {...formMethods}>
        <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
          {!editable && <Field label={t(`${i18nPrefix}.name`)} value={currentStepCode.title} />}

          <Flex gap={{ base: 6, xl: 6 }} direction="column">
            <Flex gap={2} alignItems="flex-end">
              <Flex direction="column" gap={4} w="full">
                <Field.Root invalid={editable && !!errors.fullAddress}>
                  {editable ? (
                    editingAddress || !currentStepCode.fullAddress ? (
                      <Controller
                        name="site"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <SitesSelect
                            onChange={(opt) => {
                              onChange(opt)
                              setValue("fullAddress", opt?.label || "")
                            }}
                            selectedOption={value}
                            menuPortalTarget={document.body}
                          />
                        )}
                      />
                    ) : (
                      <Flex direction="column" gap={2}>
                        <Field.Label>{t(`${i18nPrefix}.address`)}</Field.Label>
                        <Flex gap={2} alignItems="center">
                          <InputGroup>
                            <InputElement pointerEvents="none">
                              <MapPin />
                            </InputElement>
                            <Input disabled value={currentStepCode.fullAddress || ""} />
                          </InputGroup>
                        </Flex>
                      </Flex>
                    )
                  ) : (
                    <Flex direction="column" gap={2}>
                      <Field.Label>{t(`${i18nPrefix}.address`)}</Field.Label>
                      <InputGroup>
                        <InputElement pointerEvents="none">
                          <MapPin />
                        </InputElement>
                        <Input disabled value={currentStepCode.fullAddress || ""} />
                      </InputGroup>
                    </Flex>
                  )}
                  {editable && <Field.ErrorText>{errors.fullAddress?.message}</Field.ErrorText>}
                </Field.Root>
              </Flex>
            </Flex>
            {editable && (
              // keep fullAddress in form state when using the SitesSelect
              <input type="hidden" {...register("fullAddress")} />
            )}

            {!editable && (
              <Field.Root flex={1}>
                <Field.Label>{t(`${i18nPrefix}.jurisdiction`)}</Field.Label>
                <Input
                  disabled
                  value={currentStepCode.jurisdictionName || currentStepCode.jurisdiction?.qualifiedName || ""}
                />
              </Field.Root>
            )}
          </Flex>

          <Flex gap={{ base: 6, xl: 6 }} direction={{ base: "column", xl: "row" }}>
            <Flex
              gap={{ base: 6, xl: 6 }}
              width={{ base: "auto", xl: "430px" }}
              direction={{ base: "column", lg: "row" }}
            >
              {editable ? (
                <Field.Root>
                  <Field.Label htmlFor="referenceNumber">{t(`${i18nPrefix}.identifier`)}</Field.Label>
                  <Input
                    id="referenceNumber"
                    {...register("referenceNumber")}
                    defaultValue={currentStepCode.referenceNumber || ""}
                  />
                </Field.Root>
              ) : (
                <Field label={t(`${i18nPrefix}.identifier`)} value={currentStepCode.referenceNumber} />
              )}
              {editable ? (
                <Field.Root>
                  <Field.Label htmlFor="phase">{t(`${i18nPrefix}.stage`)}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      id="phase"
                      placeholder="Select stage"
                      {...register("phase")}
                      defaultValue={currentStepCode.phase || ""}
                    >
                      <option value="pre_construction">
                        {t("stepCodeChecklist.edit.projectInfo.stages.pre_construction")}
                      </option>
                      <option value="mid_construction">
                        {t("stepCodeChecklist.edit.projectInfo.stages.mid_construction")}
                      </option>
                      <option value="as_built">{t("stepCodeChecklist.edit.projectInfo.stages.as_built")}</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
              ) : (
                <Field label={t(`${i18nPrefix}.stage`)} value={currentStepCode.phase} />
              )}
            </Flex>
            {editable ? (
              <DatePickerFormControl
                flex={1}
                label={t(`${i18nPrefix}.date`) as string}
                fieldName="permitDate"
                showOptional={false}
              />
            ) : (
              <DatePickerFormControl
                flex={1}
                label={t(`${i18nPrefix}.date`) as string}
                fieldName="permitDate"
                showOptional={false}
                inputProps={{
                  readOnly: true,
                }}
                isReadOnly
              />
            )}
          </Flex>
          <Field
            maxWidth={{ base: "none", xl: "430px" }}
            label={t(`${i18nPrefix}.version`)}
            value={t(`${i18nPrefix}.buildingCodeVersions.${checklist.buildingCodeVersion}`)}
          />
          <Flex direction="column" gap={2}>
            <Text fontSize="md" fontWeight="bold">
              {t(`${i18nPrefix}.confirm`)}
            </Text>
            <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
          </Flex>
          {!editable && (
            <Text fontSize="md">
              <Trans
                i18nKey={`${i18nPrefix}.modify`}
                components={{
                  1: <Link href={`/permit-applications/${permitApplicationId}/edit`} />,
                }}
              />
            </Text>
          )}
        </Flex>
      </FormProvider>
    </>
  )
})

interface IFieldProps extends FormControlProps {
  label: string
  value: string | undefined
}

const Field = function Field({ label, value, ...props }: IFieldProps) {
  return (
    <Field.Root {...props}>
      <Field.Label>{label}</Field.Label>
      <Input disabled value={value || ""} textOverflow="ellipsis" textAlign="left" />
    </Field.Root>
  )
}
