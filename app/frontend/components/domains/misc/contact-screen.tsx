import { Box, Container, Heading, Link, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import i18next from "i18next"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { JurisdictionSearch } from "../../shared/jurisdiction-search"

export const ContactScreen = () => {
  const { t } = useTranslation()
  const mailto = "mailto:" + t("site.contactEmail")

  const contactTeamInstructions = i18next.t("site.contactTeamInstructions", {
    returnObjects: true,
  }) as string[]

  return (
    <Container maxW="container.lg" pt="16" pb="36" px="8">
      <Heading as="h1">{t("site.contact")}</Heading>

      <Heading as="h2" variant="yellowline" mt="16">
        {t("site.contactInstructions_2")}
      </Heading>
      <Text fontSize="lg">
        {t("site.contactInstructions_3")}
        {/*
					<Link ml="1" href="">
          	{t("site.listJurisdictions")}.
					</Link>
				*/}
      </Text>

      <Text mt={8} fontSize="lg">
        {t("site.contactUs.responseAim")}
      </Text>

      <Heading as="h2" variant="yellowline" mt="16">
        {t("site.contactUs.hours.title")}
      </Heading>
      <Text fontSize="lg">{t("site.contactUs.hours.availability")}</Text>
      <Text fontStyle="italic" fontSize="lg">
        {t("site.contactUs.hours.note")}
      </Text>

      <Heading as="h2" variant="yellowline" mt="16">
        {t("site.contactUs.quickHelp.title")}
      </Heading>
      <UnorderedList spacing={2} mt={4} fontSize="lg">
        <ListItem>
          <Text fontSize="lg">
            <Trans i18nKey="site.contactUs.quickHelp.loginIssues" />
          </Text>
        </ListItem>
        <ListItem>
          <Text fontSize="lg">
            <Trans i18nKey="site.contactUs.quickHelp.uploadProblems" />
          </Text>
        </ListItem>
        <ListItem>
          <Text fontSize="lg">
            <Trans i18nKey="site.contactUs.quickHelp.applicationStatus" />
          </Text>
        </ListItem>
      </UnorderedList>

      <Heading as="h2" variant="yellowline" mt="16">
        {t("site.contactUs.routing.title")}
      </Heading>
      <VStack align="start" spacing={6} mt={4} fontSize="lg">
        <Box>
          <Heading as="h3" size="sm">
            {t("site.contactUs.routing.technical.title")}
          </Heading>
          <Text fontStyle="italic" fontSize="lg">
            {t("site.contactUs.routing.technical.description")}
          </Text>
          <Text>
            <Link href={mailto} isExternal>
              {t("site.contactUs.routing.technical.email")}
            </Link>
          </Text>
        </Box>
        <Box>
          <Heading as="h3" size="sm">
            {t("site.contactUs.routing.permit.title")}
          </Heading>
          <Text fontStyle="italic" fontSize="lg">
            {t("site.contactUs.routing.permit.description")}
          </Text>
          <Text fontSize="lg">{t("site.contactUs.routing.permit.instruction")}</Text>
        </Box>
      </VStack>

      <Heading as="h2" variant="yellowline" mt="16">
        {t("site.contactUs.jurisdictionFinder.title")}
      </Heading>
      <Text mt={4} fontSize="lg">
        <Trans i18nKey="site.contactUs.jurisdictionFinder.prompt" />
      </Text>
      <JurisdictionSearch />
    </Container>
  )
}
