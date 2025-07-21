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
  Text,
} from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { SectionHeading } from "./shared/section-heading"

interface IProjectDetailsForm {
  fullAddress?: string
  projectName?: string
  projectIdentifier?: string
}

export const ProjectDetails = observer(function Part3StepCodeFormProjectDetails() {
  const i18nPrefix = "stepCode.part3.projectDetails"
  const { permitApplicationId } = useParams()
  const { checklist, stepCode } = usePart3StepCode()

  const navigate = useNavigate()
  const location = useLocation()

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IProjectDetailsForm>()

  useEffect(() => {
    if (checklist && stepCode) {
      reset({
        fullAddress: stepCode.fullAddress || "",
        projectIdentifier: stepCode.projectIdentifier || "",
        projectName: stepCode.projectName || "",
        // todo: add jurisdiction?
      })
    }
  }, [checklist, stepCode, reset])

  const onSubmit = async (data: IProjectDetailsForm) => {
    if (!checklist || !stepCode) return

    const stepCodeAttributes: Partial<IProjectDetailsForm & { id: string }> = { id: stepCode.id }
    let needsUpdate = false

    if (editable) {
      stepCodeAttributes.fullAddress = data.fullAddress

      needsUpdate = true
    }

    let checklistUpdateSucceeded = true
    if (needsUpdate) {
      checklistUpdateSucceeded = await checklist.update({ stepCodeAttributes })
    }

    if (checklistUpdateSucceeded) {
      stepCode.setProjectDetails({
        projectName: data.projectName,
        fullAddress: data.fullAddress,
        projectIdentifier: data.projectIdentifier,
        // todo: add jurisdiction?
      })

      const alternatePath = checklist.alternateNavigateAfterSavePath
      checklist.setAlternateNavigateAfterSavePath(null)
      // const stepCodeUpdateSucceeded = await stepCode.update(stepCodeAttributes)
      const sectionCompleteSucceeded = await checklist.completeSection("projectDetails")
      if (sectionCompleteSucceeded) {
        if (alternatePath) {
          navigate(alternatePath)
        } else {
          navigate(location.pathname.replace("project-details", "location-details"))
        }
      }
    } else {
      console.error("Failed to update checklist project details")
    }
  }

  if (!checklist || !stepCode) {
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
      <form onSubmit={handleSubmit(onSubmit)} name="part3SectionForm">
        <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
          <Field label={t(`${i18nPrefix}.name`)} value={stepCode.projectName} />

          <Flex gap={{ base: 6, xl: 6 }} direction={{ base: "column", xl: "row" }}>
            <FormControl isInvalid={editable && !!errors.fullAddress} width={{ base: "auto", xl: "430px" }}>
              <FormLabel {...(editable ? { htmlFor: "fullAddress" } : { fontWeight: "bold" })}>
                {t(`${i18nPrefix}.address`)}
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MapPin />
                </InputLeftElement>
                <Input
                  isDisabled={!editable}
                  {...(editable
                    ? { id: "fullAddress", ...register("fullAddress") }
                    : { value: stepCode.fullAddress || "" })}
                />
              </InputGroup>
              {editable && <FormErrorMessage>{errors.fullAddress?.message}</FormErrorMessage>}
            </FormControl>

            <Field flex={1} label={t(`${i18nPrefix}.jurisdiction`)} value={stepCode.jurisdictionName} />
          </Flex>

          <Flex gap={{ base: 6, xl: 6 }} direction={{ base: "column", xl: "row" }}>
            <Flex
              gap={{ base: 6, xl: 6 }}
              width={{ base: "auto", xl: "430px" }}
              direction={{ base: "column", lg: "row" }}
            >
              <Field label={t(`${i18nPrefix}.identifier`)} value={stepCode.projectIdentifier} />
              <Field
                label={t(`${i18nPrefix}.stage`)}
                value={checklist.projectStage ? t(`${i18nPrefix}.stages.${checklist.projectStage}`) : ""}
              />
            </Flex>
            <Field flex={1} label={t(`${i18nPrefix}.date`)} value={stepCode.permitDate || ""} />
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
          <Text fontSize="md">
            <Trans
              i18nKey={`${i18nPrefix}.modify`}
              components={{
                1: <Link href={`/permit-applications/${permitApplicationId}/edit`} />,
              }}
            />
          </Text>
        </Flex>
      </form>
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
