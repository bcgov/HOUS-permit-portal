import { Button, Container, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { ArrowSquareOut, CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../../../../setup/root"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { Part9EnergyStepEditableBlock } from "./energy-step-editable-block/part-9-energy-step-editable-block"
import { i18nPrefix } from "./i18n-prefix"

export const Part9StepCodeConfigScreen = observer(function Part9StepCodeConfigScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    stepCodeStore: { isOptionsLoaded, fetchPart9SelectOptions },
  } = useMst()

  useEffect(() => {
    const fetch = async () => await fetchPart9SelectOptions()
    !isOptionsLoaded && fetch()
  }, [isOptionsLoaded])

  const { currentJurisdiction, error } = useJurisdiction()

  if (!isOptionsLoaded) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
      <VStack spacing={6} align="start" w="full">
        <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </Button>

        <Heading mb={0} fontSize="3xl">
          {t(`${i18nPrefix}.part9Title`)}
        </Heading>

        <Text fontWeight="bold">
          {t(`${i18nPrefix}.setMinimum`)} <br />{" "}
          <Link href={t("stepCode.helpLink")} isExternal fontWeight="normal">
            {t("stepCode.helpLinkText")}
            <ArrowSquareOut />
          </Link>
        </Text>

        <Part9EnergyStepEditableBlock heading={t(`${i18nPrefix}.part9Title`)} jurisdiction={currentJurisdiction} />
      </VStack>
    </Container>
  )
})
