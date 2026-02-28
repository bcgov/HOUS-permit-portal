import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Show,
  Text,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { BceidLoginForm, BcscLoginForm, IdirLoginForm } from "../../shared/auth/login-forms"
import { CenterContainer } from "../../shared/containers/center-container"
import { HelpDrawer } from "../../shared/help-drawer"
import { EntityBasicBCeIDInfo } from "../../shared/keycloak/basicbceid/entity-basic-bceid-info"
import { LgBasicBCeIDInfo } from "../../shared/keycloak/basicbceid/lg-basic-bceid-info"
import { SubmitterBasicBCeIDInfo } from "../../shared/keycloak/basicbceid/submitter-basic-bceid-info"
import { BCSCInfo } from "../../shared/keycloak/bcsc-info"
import { EntityBusinessBCeIDInfo } from "../../shared/keycloak/businessbceid/entity-business-bceid-info copy"
import { LgBusinessBCeIDInfo } from "../../shared/keycloak/businessbceid/lg-business-bceid-info"

interface ILoginScreenProps {
  isAdmin?: boolean
}

export const LoginScreen = ({ isAdmin }: ILoginScreenProps) => {
  const { t } = useTranslation()

  return (
    <CenterContainer h="full" maxW={isAdmin ? "container.md" : "container.lg"}>
      <Flex
        direction="column"
        gap={6}
        w="full"
        flex={1}
        p={12}
        border="solid 1px"
        borderColor="border.light"
        bg="greys.white"
      >
        <Heading as="h1">{t("auth.loginTitle")}</Heading>

        <Flex direction="column" flex={1} gap={isAdmin ? 6 : 12}>
          {isAdmin ? (
            <>
              <Heading as="h2">{t("auth.adminLogin")}</Heading>
              <IdirLoginForm />
            </>
          ) : (
            <>
              <Show above="md">
                <Grid templateColumns={"1fr auto 1fr"} gap={6} width="100%" alignItems="start">
                  <GridItem>
                    <Heading as="h2">{t("auth.publicLogin")}</Heading>
                  </GridItem>

                  <GridItem rowSpan={3} h="full">
                    <Divider orientation="vertical" height="100%" borderColor="border.light" mx={12} />
                  </GridItem>

                  <GridItem>
                    <Heading as="h2">{t("auth.localGovLogin")}</Heading>
                  </GridItem>

                  <GridItem>
                    <Text>{t("auth.publicLoginDescription")}</Text>
                  </GridItem>

                  <GridItem>
                    <Text>{t("auth.localGovLoginDescription")}</Text>
                  </GridItem>

                  <GridItem>
                    <Flex direction="column" gap={6}>
                      <BcscLoginForm />
                      <BceidLoginForm />
                    </Flex>
                  </GridItem>

                  <GridItem>
                    <BceidLoginForm />
                  </GridItem>
                </Grid>
              </Show>
              <Show below="md">
                <Grid
                  templateColumns={"1fr"} // Single column on small screens, three columns on md and up
                  gap={6}
                  width="100%"
                  alignItems="start"
                >
                  <GridItem>
                    <Heading as="h2">{t("auth.publicLogin")}</Heading>
                  </GridItem>

                  <GridItem>
                    <Text>{t("auth.publicLoginDescription")}</Text>
                  </GridItem>

                  <GridItem>
                    <Flex direction="column" gap={6}>
                      <BcscLoginForm />
                      <BceidLoginForm />
                    </Flex>
                  </GridItem>

                  <GridItem>
                    <Heading as="h2">{t("auth.localGovLogin")}</Heading>
                  </GridItem>

                  <GridItem>
                    <Text>{t("auth.localGovLoginDescription")}</Text>
                  </GridItem>

                  <GridItem>
                    <BceidLoginForm />
                  </GridItem>
                </Grid>
              </Show>
            </>
          )}
          {!isAdmin && (
            <Flex direction="column">
              <Heading>{t("auth.firstTime")}</Heading>
              <Text>{t("auth.chooseSituation")}</Text>
              <Accordion mt={8} allowToggle allowMultiple>
                <AccordionItem>
                  <AccordionButton display="flex" justifyContent="space-between">
                    <Box as="span" py={2} textAlign="left">
                      <Heading as="h3">{t("auth.submitterAccordion")}</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <SubmitterBasicBCeIDInfo />
                    <BCSCInfo />
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton display="flex" justifyContent="space-between">
                    <Box as="span" py={2} textAlign="left">
                      <Heading as="h3">{t("auth.entityAccordion")}</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <EntityBasicBCeIDInfo />
                    <EntityBusinessBCeIDInfo />
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton display="flex" justifyContent="space-between">
                    <Box as="span" py={2} textAlign="left">
                      <Heading as="h3">{t("auth.lgAccordion")}</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <LgBusinessBCeIDInfo />
                    <LgBasicBCeIDInfo />
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Flex>
          )}
        </Flex>
        {isAdmin ? (
          <Text>{t("auth.adminAccountAccess")}</Text>
        ) : (
          <>
            <Text>
              <Text as="span" fontWeight="bold">
                {t("auth.loginHelp")}{" "}
              </Text>
              <Text as="span">{t("auth.goToPartners")} </Text>
              <Link href={import.meta.env.VITE_BCEID_PARTNER_URL} isExternal>
                {t("auth.bceid")}
              </Link>{" "}
              {t("ui.or")}{" "}
              <Link href={import.meta.env.VITE_BCSC_REGISTRATION_URL} isExternal>
                {t("auth.bcsc")}
              </Link>
            </Text>

            <HelpDrawer
              renderTriggerButton={({ onClick }) => (
                <Button variant="link" onClick={onClick}>
                  {t("ui.help")}
                </Button>
              )}
            />
          </>
        )}
      </Flex>
    </CenterContainer>
  )
}
