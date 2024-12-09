import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { SectionHeading } from "./shared/section-heading"

export const StartPage = observer(function Part3StepCodeFormStartPage() {
  const i18nPrefix = "stepCode.part3.startPage"
  const { checklist } = usePart3StepCode()
  const navigate = useNavigate()
  const location = useLocation()

  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState

  const onSubmit = async () => {
    await checklist.completeSection("start")

    navigate(location.pathname.replace("start", "project-details"))
  }

  return (
    <Flex direction="column" gap={6}>
      <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      <Text fontSize="md">{t(`${i18nPrefix}.description`)}</Text>
      <Flex direction="column" gap={4} p={4} bg="theme.blueLight" color="theme.blueAlt" rounded="lg">
        <Heading as="h4" fontSize="lg">
          {t(`${i18nPrefix}.info.title`)}
        </Heading>
        <Text fontSize="md">{t(`${i18nPrefix}.info.body`)}</Text>
        <Box>
          <Trans
            i18nKey={`${i18nPrefix}.info.help`}
            components={{
              1: <Link href={t(`${i18nPrefix}.info.link`)} isExternal></Link>,
              2: <ArrowSquareOut />,
            }}
          />
        </Box>
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
          {t("stepCode.part3.cta")}
        </Button>
      </form>
    </Flex>
  )
})
