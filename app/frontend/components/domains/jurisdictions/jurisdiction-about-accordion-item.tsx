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
      gap={4}
    >
      <AccordionButton
        display="flex"
        justifyContent="space-between"
        alignItems={useYellowlineHeading ? "flex-start" : "center"}
        _hover={{ bg: "transparent" }}
        px={4}
        pt={4}
        pb={8}
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
      <AccordionPanel pb={8} pt={0}>
        {children}
      </AccordionPanel>
    </AccordionItem>
  )
}
