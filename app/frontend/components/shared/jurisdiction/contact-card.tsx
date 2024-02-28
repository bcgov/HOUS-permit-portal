import { Flex, GridItem, GridItemProps, Heading, Link } from "@chakra-ui/react"
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
      minH="195px"
      p={4}
      {...rest}
    >
      <Heading as="h3" fontSize="lg">
        {contact.name}
      </Heading>
      {contact.department && `${contact.department} - `}
      {contact.title}
      <Flex mt={2} direction={{ base: "column", md: "row" }} gap={2}>
        <Flex flex={1} gap={4}>
          <Phone size={32} />
          <Flex direction="column" flex={1}>
            <Heading as="h3" fontSize="md">
              {t("contact.fields.phoneNumber")}
            </Heading>
            <Link href={`tel:+${contact.phoneNumber}`}>{contact.phoneNumber}</Link>
          </Flex>
        </Flex>
        <Flex flex={1} gap={4}>
          <Envelope size={32} />
          <Flex direction="column" flex={1}>
            <Heading as="h3" fontSize="md">
              {t("contact.fields.email")}
            </Heading>
            <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
          </Flex>
        </Flex>
      </Flex>
    </GridItem>
  )
}
