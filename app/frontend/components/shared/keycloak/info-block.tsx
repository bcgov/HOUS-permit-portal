import { Button, Flex, Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import { ArrowSquareOut, CaretRight } from "@phosphor-icons/react"
import React from "react"

export function KeycloakInfoBlock({ title, description, bulletPoints, ctaText, ctaLink, infoLink = null }) {
  return (
    <Flex direction="column" gap={2} p={6}>
      <Heading as="h4" m={0}>
        {title}
      </Heading>
      <Text fontSize="sm">{description}</Text>
      <UnorderedList fontSize="sm" pl={2}>
        {bulletPoints.map((p, index) => (
          <ListItem key={index}>{p}</ListItem>
        ))}
      </UnorderedList>
      {infoLink && (
        /* TODO: link to CMS Page */
        <Button variant="link" as={Link} href="" rightIcon={<CaretRight />}>
          {infoLink}
        </Button>
      )}
      <Button as={Link} href={ctaLink} isExternal variant="secondary" rightIcon={<ArrowSquareOut />} mt={2}>
        {ctaText}
      </Button>
    </Flex>
  )
}
