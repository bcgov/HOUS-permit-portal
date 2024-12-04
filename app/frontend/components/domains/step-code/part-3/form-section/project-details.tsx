import {
  Button,
  Flex,
  FormControl,
  FormControlProps,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Text,
} from "@chakra-ui/react"
import { MapPin } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"

export const ProjectDetails = observer(function Part3StepCodeFormProjectDetails() {
  const i18nPrefix = "stepCode.part3.projectDetails"
  const { permitApplicationId } = useParams()
  const { checklist } = usePart3StepCode()

  const navigate = useNavigate()
  const location = useLocation()

  const { handleSubmit, formState } = useForm()
  const { isLoading } = formState

  const onSubmit = async () => {
    await checklist.completeSection("projectDetails")

    navigate(location.pathname.replace("project-details", "location-details"))
  }

  return (
    <>
      <Flex direction="column" gap={2} pb={4}>
        <Heading as="h2" fontSize="2xl" variant="yellowline">
          {t(`${i18nPrefix}.heading`)}
        </Heading>
        <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text>
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap={{ base: 6, xl: 2 }} pb={4}>
          <Field label={t(`${i18nPrefix}.name`)} value={checklist.projectName} />
          <Flex gap={{ base: 6, xl: 6 }} direction={{ base: "column", xl: "row" }}>
            <FormControl width={{ base: "auto", xl: "430px" }}>
              <FormLabel fontWeight="bold">{t(`${i18nPrefix}.address`)}</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MapPin />
                </InputLeftElement>
                <Input isDisabled value={checklist.projectAddress} />
              </InputGroup>
            </FormControl>
            <Field flex={1} label={t(`${i18nPrefix}.jurisdiction`)} value={checklist.jurisdictionName} />
          </Flex>
          <Flex gap={{ base: 6, xl: 6 }} direction={{ base: "column", xl: "row" }}>
            <Flex
              gap={{ base: 6, xl: 6 }}
              width={{ base: "auto", xl: "430px" }}
              direction={{ base: "column", lg: "row" }}
            >
              <Field label={t(`${i18nPrefix}.identifier`)} value={checklist.projectIdentifier} />
              <Field
                label={t(`${i18nPrefix}.stage`)}
                value={checklist.projectStage ? t(`${i18nPrefix}.stages.${checklist.projectStage}`) : ""}
              />
            </Flex>
            <Field flex={1} label={t(`${i18nPrefix}.date`)} value={checklist.permitDate || ""} />
          </Flex>
          <Field
            maxWidth={{ base: "none", xl: "430px" }}
            label={t(`${i18nPrefix}.version`)}
            value={t(`${i18nPrefix}.buildingCodeVersions.${checklist.buildingCodeVersion}`)}
          />
          <Flex direction="column" gap={2} pb={4}>
            <Text fontSize="md" fontWeight="bold">
              {t(`${i18nPrefix}.confirm`)}
            </Text>
            <Button type="submit" variant="primary" isLoading={isLoading} isDisabled={isLoading}>
              {t(`${i18nPrefix}.cta`)}
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
  value: string
}

const Field = function Field({ label, value, ...props }: IFieldProps) {
  return (
    <FormControl mb={{ base: 0, xl: 4 }} {...props}>
      <FormLabel>{label}</FormLabel>
      <Input isDisabled value={value} textOverflow="ellipsis" />
    </FormControl>
  )
}
