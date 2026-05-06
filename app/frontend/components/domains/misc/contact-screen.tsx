import { Box, Container, Heading, Link, List, Text, VStack } from "@chakra-ui/react"
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
      <List.Root as="ul" gap={2} mt={4} fontSize="lg">
        <List.Item>
          <Text fontSize="lg">
            <Trans i18nKey="site.contactUs.quickHelp.loginIssues" />
          </Text>
        </List.Item>
        <List.Item>
          <Text fontSize="lg">
            <Trans i18nKey="site.contactUs.quickHelp.uploadProblems" />
          </Text>
        </List.Item>
        <List.Item>
          <Text fontSize="lg">
            <Trans i18nKey="site.contactUs.quickHelp.applicationStatus" />
          </Text>
        </List.Item>
      </List.Root>
      <Heading as="h2" variant="yellowline" mt="16">
        {t("site.contactUs.routing.title")}
      </Heading>
      <VStack align="start" gap={6} mt={4} fontSize="lg">
        <Box>
          <Heading as="h3" size="sm">
            {t("site.contactUs.routing.technical.title")}
          </Heading>
          <Text fontStyle="italic" fontSize="lg">
            {t("site.contactUs.routing.technical.description")}
          </Text>
          <Text>
            <Link href={mailto} target="_blank" rel="noopener noreferrer">
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
