import {
  Button,
  Center,
  Flex,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Select,
  Text,
} from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { IOption } from "../../../../../types/types"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { DatePickerFormControl } from "../../../../shared/form/input-form-control"
import { SitesSelect } from "../../../../shared/select/selectors/sites-select"
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

  const navigate = useNavigate()
  const location = useLocation()

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
      const ok = await (currentStepCode as any).update({
        fullAddress: data.fullAddress,
        referenceNumber: data.referenceNumber,
        permitDate: data.permitDate,
        phase: data.phase,
        jurisdictionId: data.jurisdictionId,
      })
    }
    const alternatePath = checklist.alternateNavigateAfterSavePath
    checklist.setAlternateNavigateAfterSavePath(null)
    const sectionCompleteSucceeded = await checklist.completeSection("projectDetails")
    if (sectionCompleteSucceeded) {
      if (alternatePath) {
        navigate(alternatePath)
      } else {
        navigate(location.pathname.replace("project-details", "location-details"))
      }
    }
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
        <form onSubmit={handleSubmit(onSubmit)} name="part3SectionForm">
          <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
            {!editable && <Field label={t(`${i18nPrefix}.name`)} value={currentStepCode.title} />}

            <Flex gap={{ base: 6, xl: 6 }} direction="column">
              <Flex gap={2} alignItems="flex-end">
                <Flex direction="column" gap={4} w="full">
                  <FormControl isInvalid={editable && !!errors.fullAddress}>
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
                          <FormLabel>{t(`${i18nPrefix}.address`)}</FormLabel>
                          <Flex gap={2} alignItems="center">
                            <InputGroup>
                              <InputLeftElement pointerEvents="none">
                                <MapPin />
                              </InputLeftElement>
                              <Input isDisabled value={currentStepCode.fullAddress || ""} />
                            </InputGroup>
                          </Flex>
                        </Flex>
                      )
                    ) : (
                      <Flex direction="column" gap={2}>
                        <FormLabel>{t(`${i18nPrefix}.address`)}</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <MapPin />
                          </InputLeftElement>
                          <Input isDisabled value={currentStepCode.fullAddress || ""} />
                        </InputGroup>
                      </Flex>
                    )}
                    {editable && <FormErrorMessage>{errors.fullAddress?.message}</FormErrorMessage>}
                  </FormControl>
                </Flex>
              </Flex>
              {editable && (
                // keep fullAddress in form state when using the SitesSelect
                <input type="hidden" {...register("fullAddress")} />
              )}

              {!editable && (
                <FormControl flex={1}>
                  <FormLabel>{t(`${i18nPrefix}.jurisdiction`)}</FormLabel>
                  <Input
                    isDisabled
                    value={currentStepCode.jurisdictionName || currentStepCode.jurisdiction?.qualifiedName || ""}
                  />
                </FormControl>
              )}
            </Flex>

            <Flex gap={{ base: 6, xl: 6 }} direction={{ base: "column", xl: "row" }}>
              <Flex
                gap={{ base: 6, xl: 6 }}
                width={{ base: "auto", xl: "430px" }}
                direction={{ base: "column", lg: "row" }}
              >
                {editable ? (
                  <FormControl>
                    <FormLabel htmlFor="referenceNumber">{t(`${i18nPrefix}.identifier`)}</FormLabel>
                    <Input
                      id="referenceNumber"
                      {...register("referenceNumber")}
                      defaultValue={currentStepCode.referenceNumber || ""}
                    />
                  </FormControl>
                ) : (
                  <Field label={t(`${i18nPrefix}.identifier`)} value={currentStepCode.referenceNumber} />
                )}
                {editable ? (
                  <FormControl>
                    <FormLabel htmlFor="phase">{t(`${i18nPrefix}.stage`)}</FormLabel>
                    <Select
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
                    </Select>
                  </FormControl>
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
              <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
                {t("stepCode.part3.cta")}
              </Button>
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
        </form>
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
    <FormControl {...props}>
      <FormLabel>{label}</FormLabel>
      <Input isDisabled value={value || ""} textOverflow="ellipsis" textAlign="left" />
    </FormControl>
  )
}
