import { Box, Container, Flex, Grid, GridItem, Heading, Link, Show, Text } from "@chakra-ui/react"
import { faSquareEnvelope, faSquarePhone } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { IContact, TLatLngTuple } from "../../../types/types"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { ReadOnlySlate } from "../../shared/base/read-only-slate"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { JurisdictionMap } from "../../shared/module-wrappers/jurisdiction-map"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
export interface Jurisdiction {
  name: string
  contacts: IContact[]
}

// Starting position for the map
const mapPosition: TLatLngTuple = [51.505, -0.09]
const linePositions: TLatLngTuple[] = [
  [51.512, -0.091],
  [51.512, -0.114],
  [51.507, -0.114],
  [51.507, -0.091],
  [51.512, -0.091],
] // Coordinates for your custom lines

export const JurisdictionScreen = observer(() => {
  const { t } = useTranslation()
  const { jurisdiction, error } = useJurisdiction()

  if (!jurisdiction) {
    return (
      <Flex as="main" w="full" bg="greys.white">
        <SharedSpinner />
      </Flex>
    )
  }

  const { contacts, name, checklistSlateData, lookOutSlateData } = jurisdiction

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      <BlueTitleBar title={name} imageSrc={"/images/jurisdiction-bus.svg"} />
      <Show below="md">
        <JurisdictionMap mapPosition={mapPosition} linePositions={linePositions} />
      </Show>
      <Container maxW="container.lg" py={{ base: 6, md: 16 }} px={8}>
        <Flex direction="column" gap={16}>
          <Flex gap={14}>
            <Show above="md">
              <Flex flex={1}>
                <JurisdictionMap mapPosition={mapPosition} linePositions={linePositions} />
              </Flex>
            </Show>
            <Flex as="section" flex={1} direction="column" gap={4}>
              <YellowLineSmall mt={4} />
              <Heading>{t("jurisdiction.title")}</Heading>
              <Text>{t("jurisdiction.description")}</Text>
              <RouterLinkButton to="#" variant="primary">
                {t("jurisdiction.startApplication")}
              </RouterLinkButton>
            </Flex>
          </Flex>
          <Flex direction={{ base: "column", md: "row" }} gap={6}>
            <Flex direction="column" flex={3}>
              <Flex as="section" direction="column" gap={2}>
                <YellowLineSmall mt={4} />
                <Heading>{t("jurisdiction.checklist")}</Heading>
                <ReadOnlySlate initialValue={checklistSlateData} flex={1} />
              </Flex>
            </Flex>
            <Flex
              as="section"
              direction="column"
              p={6}
              flex={2}
              gap={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="border.light"
            >
              <Heading>{t("jurisdiction.lookOut")}</Heading>
              <ReadOnlySlate initialValue={lookOutSlateData} />
            </Flex>
          </Flex>
          <Flex as="section" direction="column" borderRadius="lg" boxShadow="md">
            <Box py={3} px={6} bg="theme.blueAlt" borderTopRadius="lg">
              <Heading color="greys.white" fontSize="xl">
                {t("jurisdiction.contactInfo")}
              </Heading>
            </Box>
            <Flex direction="column" p={6} gap={9}>
              <Text>CUSTOM MESSAGE ABOUT CONTACTS HERE</Text>

              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                {contacts.map((contact, index) => (
                  <ContactGridItem key={index} contact={contact} />
                ))}
              </Grid>
            </Flex>
          </Flex>
          <RouterLink to="#">{t("jurisdiction.didNotFind")}</RouterLink>
        </Flex>
      </Container>
    </Flex>
  )
})

interface IContactBoxProps {
  contact: IContact
}

const ContactGridItem = ({ contact }: IContactBoxProps) => {
  return (
    <GridItem
      as="section"
      colSpan={{ sm: 1, md: 1 }}
      borderRadius="sm"
      border="1px solid"
      borderColor="border.light"
      p={4}
    >
      <Heading fontSize="lg">{contact.name}</Heading>
      {contact.firstNation && `${contact.firstNation} - `}
      {contact.title}
      <Flex mt={2} direction={{ base: "column", md: "row" }} gap={2}>
        <Flex flex={1} gap={4}>
          <FontAwesomeIcon style={{ height: "32px", width: "32px" }} icon={faSquarePhone} />
          <Flex direction="column" flex={1}>
            <Heading fontSize="md">Telephone</Heading>
            <Link href={`tel:+${contact.phone}`}>{contact.phone}</Link>
          </Flex>
        </Flex>
        <Flex flex={1} gap={4}>
          <FontAwesomeIcon style={{ height: "32px", width: "32px" }} icon={faSquareEnvelope} />
          <Flex direction="column" flex={1}>
            <Heading fontSize="md">Email</Heading>
            <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
          </Flex>
        </Flex>
      </Flex>
    </GridItem>
  )
}
