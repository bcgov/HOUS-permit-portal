import {
  Box,
  Button,
  Flex,
  GridItem,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Download } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { EContactSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"

export interface IContactSummaryModalProps extends ReturnType<typeof useDisclosure> {
  permitApplication: IPermitApplication
}

export const ContactSummaryModal = ({ isOpen, onOpen, onClose, permitApplication }) => {
  const { t } = useTranslation()

  const { contacts } = permitApplication

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex w="full" justify="space-between" my={6}>
            <Heading as="h1" textTransform={"capitalize"}>
              {t("permitApplication.show.contactsSummary")}
            </Heading>
            <Button variant="link" leftIcon={<Download />}>
              {t("permitApplication.show.downloadApplication")}
            </Button>
          </Flex>
          <ModalCloseButton fontSize="11px" />
        </ModalHeader>
        <ModalBody py={6}>
          <SearchGrid templateColumns="repeat(6, 1fr)">
            <Box display={"contents"} role={"rowgroup"}>
              <Box display={"contents"} role={"row"}>
                <GridItem
                  as={Flex}
                  gridColumn={"span 6"}
                  p={6}
                  bg={"greys.grey10"}
                  justifyContent={"space-between"}
                  align="center"
                >
                  <Text role={"heading"} as={"h3"} color={"black"} fontSize={"sm"} height="fit-content">
                    {t("permitApplication.show.contactSummaryHeading")}
                  </Text>
                </GridItem>
              </Box>
              <Box display={"contents"} role={"row"}>
                {Object.values(EContactSortFields).map((field) => (
                  <GridHeader key={field} role={"columnheader"} cursor="default">
                    <Flex
                      w={"full"}
                      justifyContent={"space-between"}
                      cursor="default"
                      borderRight={"1px solid"}
                      borderColor={"border.light"}
                      px={4}
                    >
                      <Text textAlign="left" cursor="default">
                        {field}
                      </Text>
                      {/* <SortIcon<EJurisdictionSortFields> field={field} currentSort={sort} /> */}
                    </Flex>
                  </GridHeader>
                ))}
              </Box>
            </Box>

            {contacts.map((contact, index) => (
              <Box key={contact.id} className={"contact-index-grid-row"} role={"row"} display={"contents"}>
                <SearchGridItem key={`title-${index}`}>{contact.title}</SearchGridItem>
                <SearchGridItem key={`name-${index}`}>{contact.name}</SearchGridItem>
                <SearchGridItem key={`organization-${index}`}>{contact.organization}</SearchGridItem>
                <SearchGridItem key={`email-${index}`}>{contact.email}</SearchGridItem>
                <SearchGridItem key={`phone-${index}`}>{contact.phone}</SearchGridItem>
                <SearchGridItem key={`address-${index}`}>{contact.address}</SearchGridItem>
              </Box>
            ))}
          </SearchGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
