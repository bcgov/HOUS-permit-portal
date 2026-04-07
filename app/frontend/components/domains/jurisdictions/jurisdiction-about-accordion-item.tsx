import { AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Heading } from "@chakra-ui/react"
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
    <AccordionItem
      display="flex"
      flexDirection="column"
      border="none"
      borderTop={showTopSeparator ? "1px solid" : "none"}
      borderColor={showTopSeparator ? "theme.yellow" : undefined}
      gap={2}
    >
      <AccordionButton
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
        <AccordionIcon alignSelf="center" fontSize="2xl" fontWeight="light" />
      </AccordionButton>
      <AccordionPanel px={{ base: 4, md: 0 }}>{children}</AccordionPanel>
    </AccordionItem>
  )
}
