import { Button, Container, Divider, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { ArrowRight, ArrowSquareOut, CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { RouterLink } from "../../../../../shared/navigation/router-link"
import { i18nPrefix } from "./i18n-prefix"

interface INavRowProps {
  label: string
  to: string
}

function NavRow({ label, to }: INavRowProps) {
  return (
    <RouterLink to={to} w="full" _hover={{ textDecoration: "none" }}>
      <Flex
        justify="space-between"
        align="center"
        w="full"
        py={4}
        px={2}
        _hover={{ bg: "hover.blue" }}
        cursor="pointer"
        borderBottomWidth={1}
        borderColor="border.light"
      >
        <Text fontSize="md">{label}</Text>
        <ArrowRight size={20} />
      </Flex>
    </RouterLink>
  )
}

export const StepCodeRequirementsLandingScreen = observer(function StepCodeRequirementsLandingScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
      <VStack spacing={6} align="start" w="full">
        <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </Button>

        <Heading mb={0} fontSize="3xl">
          {t(`${i18nPrefix}.title`)}
        </Heading>

        <Text color="text.secondary">{t(`${i18nPrefix}.landingDescription`)}</Text>

        <Link href={t("stepCode.helpLink")} isExternal color="text.link">
          {t(`${i18nPrefix}.bcDefinitionsLink`)}
          <ArrowSquareOut style={{ display: "inline", marginLeft: "4px" }} />
        </Link>

        <Divider />

        <VStack spacing={0} w="full" divider={<></>}>
          <NavRow label={t(`${i18nPrefix}.climateZonesTitle`)} to="climate-zones" />
          <NavRow label={t(`${i18nPrefix}.part3Title`)} to="part-3" />
          <NavRow label={t(`${i18nPrefix}.part9Title`)} to="part-9" />
        </VStack>
      </VStack>
    </Container>
  )
})
