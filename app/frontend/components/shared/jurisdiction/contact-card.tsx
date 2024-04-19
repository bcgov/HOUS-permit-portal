import { Box, Flex, GridItem, GridItemProps, Heading, Link } from "@chakra-ui/react"
import { Envelope, Phone } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IContact } from "../../../types/types"

interface IContactCardProps extends GridItemProps {
  contact: IContact
}

export const ContactCard = ({ contact, ...rest }: IContactCardProps) => {
  const { t } = useTranslation()

  return (
    <GridItem
      as="section"
      borderRadius="sm"
      border="1px solid"
      borderColor="border.light"
      h="fit-content"
      minH="175px"
      p={4}
      {...rest}
    >
      <Heading as="h3" mb="1">
        {contact.firstName} {contact.lastName}
      </Heading>
      {contact.department && `${contact.department} - `}
      {contact.title}
      <Flex mt={4} direction={{ base: "column", md: "row" }} gap={2}>
        <Flex flex={1} gap={4} alignItems="flex-start">
          <Box bg="theme.blueAlt" borderRadius="full" p="6px" w="8">
            <Phone weight="fill" size="full" color="white" />
          </Box>
          <Flex direction="column" flex={1}>
            <Heading as="h4" fontSize="md" mb="0">
              {t("contact.fields.phone")}
            </Heading>
            <Link href={`tel:+${contact.phone}`} isExternal>
              {contact.phone}
            </Link>
          </Flex>
        </Flex>
        <Flex flex={1} gap={4} alignItems="flex-start">
          <Box bg="theme.blueAlt" borderRadius="full" p="6px" w="8">
            <Envelope weight="fill" size="full" color="white" />
          </Box>
          <Flex direction="column" flex={1}>
            <Heading as="h4" fontSize="md" mb="0">
              {t("contact.fields.email")}
            </Heading>
            <Link href={`mailto:${contact.email}`} isExternal>
              {contact.email}
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </GridItem>
  )
}
