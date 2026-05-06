import { Accordion, Heading } from "@chakra-ui/react"
import React from "react"

export type TJurisdictionAboutAccordionItemProps = {
  headingId: string
  title: React.ReactNode
  useYellowlineHeading?: boolean
  showTopSeparator?: boolean
  children: React.ReactNode
}

export function JurisdictionAboutAccordionItem({
  headingId,
  title,
  useYellowlineHeading = false,
  showTopSeparator = true,
  children,
}: TJurisdictionAboutAccordionItemProps) {
  return (
    <Accordion.Item
      display="flex"
      flexDirection="column"
      border="none"
      borderTop={showTopSeparator ? "1px solid" : "none"}
      borderColor={showTopSeparator ? "theme.yellow" : undefined}
      gap={4}
      value="item-0"
    >
      <Accordion.ItemTrigger
        display="flex"
        justifyContent="space-between"
        alignItems={useYellowlineHeading ? "flex-start" : "center"}
        _hover={{ bg: "transparent" }}
        px={{ base: 4, md: 0 }}
        pt={4}
        pb={4}
      >
        <Heading
          id={headingId}
          as="h2"
          variant={useYellowlineHeading ? "yellowline" : undefined}
          fontSize="xl"
          fontWeight={useYellowlineHeading ? undefined : "bold"}
          flex={1}
          textAlign="left"
          my={0}
        >
          {title}
        </Heading>
        <Accordion.ItemIndicator alignSelf="center" fontSize="2xl" fontWeight="light" />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent px={{ base: 4, md: 0 }} py="0">
        <Accordion.ItemBody>{children}</Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  )
}
