import { Box, BoxProps, Flex, Heading, Link, Text } from "@chakra-ui/react"
import { Envelope, Phone } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IContact } from "../../../types/types"

export interface IJurisdictionAboutContactCardProps extends BoxProps {
  contact: IContact
}

export const JurisdictionAboutContactCard = ({ contact, ...rest }: IJurisdictionAboutContactCardProps) => {
  const { t } = useTranslation()

  return (
    <Box as="section" borderRadius="md" bg="greys.grey10" px={6} py={4} {...rest}>
      <Heading as="h3" fontSize="md" fontWeight="bold" mb={2} color="text.primary">
        {contact.firstName} {contact.lastName}
      </Heading>
      <Text fontSize="sm" color="text.primary" mb={4}>
        {[contact.department, contact.title].filter(Boolean).join(" — ")}
      </Text>
      <Flex direction="column" gap={3}>
        <Flex gap={4} align="flex-start" minH={8}>
          <Flex align="center" justify="center" bg="theme.blueAlt" borderRadius="full" w={8} h={8} flexShrink={0}>
            <Phone size={18} color="white" />
          </Flex>
          <Flex direction="column" flex={1} minW={0}>
            <Text fontWeight="bold" color="text.primary">
              {t("contact.fields.telephone")}
            </Text>
            {contact.phone ? (
              <Link href={`tel:${contact.phone}`} color="text.link" textDecoration="underline" isExternal>
                {contact.phone}
              </Link>
            ) : null}
          </Flex>
        </Flex>
        <Flex gap={4} align="flex-start" minH={8}>
          <Flex align="center" justify="center" bg="theme.blueAlt" borderRadius="full" w={8} h={8} flexShrink={0}>
            <Envelope size={18} color="white" />
          </Flex>
          <Flex direction="column" flex={1} minW={0}>
            <Text fontWeight="bold" color="text.primary">
              {t("contact.fields.email")}
            </Text>
            {contact.email ? (
              <Link href={`mailto:${contact.email}`} color="text.link" textDecoration="underline" isExternal>
                {contact.email}
              </Link>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
