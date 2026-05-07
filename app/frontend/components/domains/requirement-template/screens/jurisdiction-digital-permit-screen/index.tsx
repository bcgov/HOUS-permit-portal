import { Box, Center, Container, Heading, Link, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { useMst } from "../../../../../setup/root"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { DigitalBuildingPermitsList } from "../../digital-building-permits-list"

export const JurisdictionDigitalPermitScreen = observer(function JurisdictionDigitalPermitScreen() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />

  return (
    <Container maxW="container.lg" w="full" p={8} as="main">
      <Box w="full" px={8}>
        <Heading as="h1" size="2xl">
          {t("digitalBuildingPermits.index.title")}
        </Heading>
        <Text color="text.secondary" my={6}>
          {t("digitalBuildingPermits.index.selectPermit")}
        </Text>

        <DigitalBuildingPermitsList />
        <Center>
          <Box bg="greys.grey03" p={4} w="75%" mt={24}>
            <Trans
              i18nKey="digitalBuildingPermits.index.requestNewPromptWithLink"
              components={{
                1: (
                  <Link href={`mailto:digital.codes.permits@gov.bc.ca?subject=New%20permit%20type%20requested`}></Link>
                ),
              }}
            />
          </Box>
        </Center>
      </Box>
    </Container>
  )
})
