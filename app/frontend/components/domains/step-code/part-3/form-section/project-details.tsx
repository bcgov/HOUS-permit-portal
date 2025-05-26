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
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { SectionHeading } from "./shared/section-heading"

interface IProjectDetailsForm {
  projectName?: string
  projectAddress?: string
  jurisdictionName?: string
  projectIdentifier?: string
  permitDate?: string
}

export const ProjectDetails = observer(function Part3StepCodeFormProjectDetails() {
  const i18nPrefix = "stepCode.part3.projectDetails"
  const { permitApplicationId: routePermitApplicationId } = useParams()
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
        projectName: stepCode.projectName || "",
        projectAddress: stepCode.projectAddress || "",
        jurisdictionName: stepCode.jurisdictionName || "",
        projectIdentifier: stepCode.projectIdentifier || "",
        permitDate: stepCode.permitDate || "",
      })
    }
  }, [checklist, stepCode, reset])

  const onSubmit = async (data: IProjectDetailsForm) => {
    if (!checklist || !stepCode) return

    const stepCodeAttributes: Partial<IProjectDetailsForm & { id: string }> = { id: stepCode.id }
    let needsUpdate = false

    if (stepCode.parentType !== "PermitApplication") {
      if (!stepCode.projectName && data.projectName) {
        stepCodeAttributes.projectName = data.projectName
        needsUpdate = true
      }
      if (!stepCode.projectAddress && data.projectAddress) {
        stepCodeAttributes.projectAddress = data.projectAddress
        needsUpdate = true
      }
      if (!stepCode.jurisdictionName && data.jurisdictionName) {
        stepCodeAttributes.jurisdictionName = data.jurisdictionName
        needsUpdate = true
      }
      if (!stepCode.projectIdentifier && data.projectIdentifier) {
        stepCodeAttributes.projectIdentifier = data.projectIdentifier
        needsUpdate = true
      }
      if (!stepCode.permitDate && data.permitDate) {
        stepCodeAttributes.permitDate = data.permitDate
        needsUpdate = true
      }
    }

    let checklistUpdateSucceeded = true
    if (needsUpdate) {
      checklistUpdateSucceeded = await checklist.update({ step_code_attributes: stepCodeAttributes })
    }

    if (checklistUpdateSucceeded) {
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

  const isParentPermitApplication = stepCode.parentType === "PermitApplication"

  const isEditable = (fieldValue: string | undefined | null) => !isParentPermitApplication && !fieldValue

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
        <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text>
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)} name="part3SectionForm">
        <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
          {isEditable(stepCode.projectName) ? (
            <FormControl isInvalid={!!errors.projectName}>
              <FormLabel htmlFor="projectName">{t(`${i18nPrefix}.name`)}</FormLabel>
              <Input id="projectName" {...register("projectName")} />
              <FormErrorMessage>{errors.projectName?.message}</FormErrorMessage>
            </FormControl>
          ) : (
            <Field label={t(`${i18nPrefix}.name`)} value={stepCode.projectName} />
          )}

          <Flex gap={{ base: 6, xl: 6 }} direction={{ base: "column", xl: "row" }}>
            {isEditable(stepCode.projectAddress) ? (
              <FormControl isInvalid={!!errors.projectAddress} width={{ base: "auto", xl: "430px" }}>
                <FormLabel htmlFor="projectAddress">{t(`${i18nPrefix}.address`)}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <MapPin />
                  </InputLeftElement>
                  <Input id="projectAddress" {...register("projectAddress")} />
                </InputGroup>
                <FormErrorMessage>{errors.projectAddress?.message}</FormErrorMessage>
              </FormControl>
            ) : (
              <FormControl width={{ base: "auto", xl: "430px" }}>
                <FormLabel fontWeight="bold">{t(`${i18nPrefix}.address`)}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <MapPin />
                  </InputLeftElement>
                  <Input isDisabled value={stepCode.projectAddress || ""} />
                </InputGroup>
              </FormControl>
            )}

            {isEditable(stepCode.jurisdictionName) ? (
              <FormControl isInvalid={!!errors.jurisdictionName} flex={1}>
                <FormLabel htmlFor="jurisdictionName">{t(`${i18nPrefix}.jurisdiction`)}</FormLabel>
                <Input id="jurisdictionName" {...register("jurisdictionName")} />
                <FormErrorMessage>{errors.jurisdictionName?.message}</FormErrorMessage>
              </FormControl>
            ) : (
              <Field flex={1} label={t(`${i18nPrefix}.jurisdiction`)} value={stepCode.jurisdictionName} />
            )}
          </Flex>

          <Flex gap={{ base: 6, xl: 6 }} direction={{ base: "column", xl: "row" }}>
            <Flex
              gap={{ base: 6, xl: 6 }}
              width={{ base: "auto", xl: "430px" }}
              direction={{ base: "column", lg: "row" }}
            >
              {isEditable(stepCode.projectIdentifier) ? (
                <FormControl isInvalid={!!errors.projectIdentifier}>
                  <FormLabel htmlFor="projectIdentifier">{t(`${i18nPrefix}.identifier`)}</FormLabel>
                  <Input id="projectIdentifier" {...register("projectIdentifier")} />
                  <FormErrorMessage>{errors.projectIdentifier?.message}</FormErrorMessage>
                </FormControl>
              ) : (
                <Field label={t(`${i18nPrefix}.identifier`)} value={stepCode.projectIdentifier} />
              )}
              <Field
                label={t(`${i18nPrefix}.stage`)}
                value={checklist.projectStage ? t(`${i18nPrefix}.stages.${checklist.projectStage}`) : ""}
              />
            </Flex>
            {isEditable(stepCode.permitDate) ? (
              <FormControl isInvalid={!!errors.permitDate} flex={1}>
                <FormLabel htmlFor="permitDate">{t(`${i18nPrefix}.date`)}</FormLabel>
                <Input id="permitDate" type="date" {...register("permitDate")} />
                <FormErrorMessage>{errors.permitDate?.message}</FormErrorMessage>
              </FormControl>
            ) : (
              <Field flex={1} label={t(`${i18nPrefix}.date`)} value={stepCode.permitDate || ""} />
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
          <Text fontSize="md">
            <Trans
              i18nKey={`${i18nPrefix}.modify`}
              components={{
                1: <Link href={`/permit-applications/${routePermitApplicationId}/edit`} />,
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
