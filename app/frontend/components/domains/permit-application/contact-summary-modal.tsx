import { Box, Dialog, Flex, GridItem, Heading, Link, Portal, Text, useDisclosure } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { EContactSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"

export interface IContactSummaryModalProps extends Partial<ReturnType<typeof useDisclosure>> {
  permitApplication: IPermitApplication
  isOpen?: boolean
  onClose: () => void
}

export const ContactSummaryModal = ({ isOpen, open, onClose, permitApplication }: IContactSummaryModalProps) => {
  const { t } = useTranslation()

  const contacts = permitApplication.contacts as Array<{
    id: string
    title?: string
    name?: string
    email?: string
    phone?: string
    address?: string | { name?: string }
  }>

  return (
    <Dialog.Root
      open={open ?? isOpen ?? false}
      size="xl"
      onOpenChange={(e) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Flex w="full" justify="space-between" my={3}>
                <Heading as="h1" textTransform={"capitalize"}>
                  {t("permitApplication.show.contactsSummary")}
                </Heading>
              </Flex>
              <Dialog.CloseTrigger fontSize="11px" />
            </Dialog.Header>
            <Dialog.Body py={6}>
              <SearchGrid templateColumns="repeat(5, 1fr)">
                <Box display={"contents"} role={"rowgroup"}>
                  <Box display={"contents"} role={"row"}>
                    <GridItem
                      gridColumn={"span 5"}
                      p={6}
                      bg={"greys.grey10"}
                      justifyContent={"space-between"}
                      align="center"
                      asChild
                    >
                      <Flex>
                        <Text role={"heading"} as={"h3"} color={"black"} fontSize={"sm"} height="fit-content">
                          {t("permitApplication.show.contactSummaryHeading")}
                        </Text>
                      </Flex>
                    </GridItem>
                  </Box>
                  <Box display={"contents"} role={"row"}>
                    {Object.values(EContactSortFields).map((field, index) => (
                      <GridHeader key={field} role={"columnheader"}>
                        <Flex
                          w={"full"}
                          justifyContent={"space-between"}
                          cursor="default"
                          borderColor={"border.light"}
                          borderLeftWidth={index == 0 ? 0 : 1}
                          px={4}
                        >
                          <Text textAlign="left" cursor="default">
                            {field}
                          </Text>
                        </Flex>
                      </GridHeader>
                    ))}
                  </Box>
                </Box>
                {contacts.map((contact) => {
                  const { title, name, email, phone, address } = contact
                  const displayAddress = typeof address === "string" ? address : address?.name
                  return (
                    <Contact
                      key={contact.id}
                      title={title}
                      name={name}
                      email={email}
                      phone={phone}
                      address={displayAddress}
                    />
                  )
                })}
                {permitApplication.stepCode && (
                  <EnergyAdvisor checklist={permitApplication.stepCode.primaryChecklist} />
                )}
              </SearchGrid>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

function EnergyAdvisor({ checklist }) {
  const { completedBy, completedByEmail, completedByPhone, completedByAddress } = checklist
  if (!(completedBy || completedByEmail || completedByPhone || completedByAddress)) return <></>

  return (
    <Contact
      title={t("stepCodeChecklist.edit.completedBy.energyAdvisor")}
      name={completedBy}
      email={completedByEmail}
      phone={completedByPhone}
      address={completedByAddress}
    />
  )
}

function Contact({ title, name, email, phone, address }) {
  return (
    <Box className={"contact-index-grid-row"} role={"row"} display={"contents"}>
      <SearchGridItem fontWeight="bold">{title}</SearchGridItem>
      <SearchGridItem>{name}</SearchGridItem>
      <SearchGridItem>
        <Link href={`mailto:${email}`} target="_blank" rel="noopener noreferrer">
          {email}
        </Link>
      </SearchGridItem>
      <SearchGridItem>
        <Link href={`tel:${phone}`} target="_blank" rel="noopener noreferrer">
          {phone}
        </Link>
      </SearchGridItem>
      <SearchGridItem>{address}</SearchGridItem>
    </Box>
  )
}
