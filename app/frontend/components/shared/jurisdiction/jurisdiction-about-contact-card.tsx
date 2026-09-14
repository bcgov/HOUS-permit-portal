import { Box, BoxProps, Flex, Heading, Link, Text } from "@chakra-ui/react"
import { Envelope, Phone } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IContact } from "../../../types/types"
import { mailtoHref, telHref } from "../../../utils/utility-functions"

export interface IJurisdictionAboutContactCardProps extends BoxProps {
  contact: IContact
}

export const JurisdictionAboutContactCard = ({ contact, ...rest }: IJurisdictionAboutContactCardProps) => {
  const { t } = useTranslation()
  const phone = contact.phone?.trim()
  const email = contact.email?.trim()
  const extension = contact.extension?.trim()
  const subtitle = [contact.department, contact.title].filter(Boolean).join(" — ")
  const hasContactMethods = !!(phone || email)

  return (
    <Box as="section" borderRadius="md" bg="greys.grey10" px={6} py={4} {...rest}>
      <Heading as="h3" fontSize="md" fontWeight="bold" mb={subtitle || hasContactMethods ? 2 : 0} color="text.primary">
        {contact.firstName} {contact.lastName}
      </Heading>
      {subtitle ? (
        <Text fontSize="sm" color="text.primary" mb={hasContactMethods ? 4 : 0}>
          {subtitle}
        </Text>
      ) : null}
      {hasContactMethods ? (
        <Flex direction="column" gap={3}>
          {phone ? (
            <Flex gap={4} align="flex-start" minH={8}>
              <Flex align="center" justify="center" bg="theme.blueAlt" borderRadius="full" w={8} h={8} flexShrink={0}>
                <Phone size={18} color="white" />
              </Flex>
              <Flex direction="column" flex={1} minW={0}>
                <Text fontWeight="bold" color="text.primary">
                  {t("contact.fields.telephone")}
                </Text>
                <Link href={telHref(phone)} color="text.link" textDecoration="underline" isExternal>
                  {phone}
                </Link>
                {extension ? (
                  <Text color="text.primary">
                    {t("contact.fields.extension")} {extension}
                  </Text>
                ) : null}
              </Flex>
            </Flex>
          ) : null}
          {email ? (
            <Flex gap={4} align="flex-start" minH={8}>
              <Flex align="center" justify="center" bg="theme.blueAlt" borderRadius="full" w={8} h={8} flexShrink={0}>
                <Envelope size={18} color="white" />
              </Flex>
              <Flex direction="column" flex={1} minW={0}>
                <Text fontWeight="bold" color="text.primary">
                  {t("contact.fields.email")}
                </Text>
                <Link href={mailtoHref(email)} color="text.link" textDecoration="underline" isExternal>
                  {email}
                </Link>
              </Flex>
            </Flex>
          ) : null}
        </Flex>
      ) : null}
    </Box>
  )
}
