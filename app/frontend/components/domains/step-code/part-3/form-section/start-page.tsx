import { Box, Center, Flex, Heading, Link, Text } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

export const StartPage = observer(function Part3StepCodeFormStartPage() {
  const i18nPrefix = "stepCode.part3.startPage"
  const { checklist, isLoading } = usePart3StepCode()
  const { handleSubmit, formState } = useForm()
  const { isSubmitting } = formState

  if (isLoading) {
    return (
      <Center p={10}>
        <SharedSpinner />
      </Center>
    )
  }

  const onSubmit = async () => {
    if (!checklist) return
    const updated = await checklist.completeSection("start")
    if (!updated) throw new Error("Save failed")
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
      <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Flex>
  )
})
