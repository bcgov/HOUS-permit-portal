import { Button, Container, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { i18nPrefix } from "./i18n-prefix"
import { Part3HeatingDegreeDaysForm } from "./part-3-heating-degree-days-form"

export const ClimateZonesScreen = observer(function ClimateZonesScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentJurisdiction, error } = useJurisdiction()

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
      <VStack spacing={6} align="start" w="full">
        <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </Button>

        <Heading mb={0} fontSize="3xl">
          {t(`${i18nPrefix}.climateZonesTitle`)}
        </Heading>

        <Text fontWeight="bold">{t(`${i18nPrefix}.part3SetMinimum`)}</Text>

        <Part3HeatingDegreeDaysForm jurisdiction={currentJurisdiction} />
      </VStack>
    </Container>
  )
})
