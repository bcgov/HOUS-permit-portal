import { Box, Container, Heading, Link, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr"
import i18next from "i18next"
import React from "react"
import { useTranslation } from "react-i18next"

export const ContactScreen = () => {
  const { t } = useTranslation()
  const mailto = "mailto:" + t("site.contactEmail")

  const contactTeamInstructions = i18next.t("site.contactTeamInstructions", {
    returnObjects: true,
  }) as string[]

  return (
    <Container maxW="container.lg" pt="16" pb="36" px="8">
      <Heading as="h1">{t("site.contact")}</Heading>
      <Text>
        <strong>{t("site.contactInstructions_1")}</strong>
      </Text>

      <Heading as="h2" variant="yellowline" mt="16">
        {t("site.contactInstructions_2")}
      </Heading>
      <Text>
        {t("site.contactInstructions_3")}
        {/*
					<Link ml="1" href="">
          	{t("site.listJurisdictions")}.
					</Link>
				*/}
      </Text>

      <VStack
        as="section"
        gap="0"
        align="flex-start"
        borderRadius="md"
        border="1px solid"
        borderColor="border.light"
        width="500px"
        maxWidth="full"
        mt="16"
      >
        <Heading as="h3" m="0" bg="theme.blue" color="greys.white" py="3" px="6" borderTopRadius="md" width="full">
          {t("site.contactTeamInstructionsTitle")}
        </Heading>
        <Box px="6" py="4">
          <UnorderedList m="0" pl="4">
            {contactTeamInstructions.map((inst) => (
              <ListItem key={inst}>{inst}</ListItem>
            ))}
          </UnorderedList>

          <Text fontWeight="bold" mt="4" mb="2">
            {t("site.contactTeamCTA")}
            <Link href={mailto} isExternal ml="1">
              {t("site.contactEmail")}
            </Link>
          </Text>
        </Box>
      </VStack>

      <Heading as="h2" variant="yellowline" mt="16">
        {t("site.contactNeedHelp")}
      </Heading>
      <Text>
        {t("site.contactNeedHelpInstructions")}
        <Link
          href="https://www2.gov.bc.ca/gov/content/home/get-help-with-government-services"
          target="_blank"
          rel="noopener noreferrer"
          isExternal
          ml="1"
        >
          {t("site.contactNeedHelpCTA")} <ArrowSquareOut />
        </Link>
      </Text>
    </Container>
  )
}
