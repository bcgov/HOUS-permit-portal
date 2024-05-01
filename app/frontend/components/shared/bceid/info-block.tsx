import { Button, Flex, Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import { ArrowSquareOut, CaretRight } from "@phosphor-icons/react"
import React from "react"

export function BCeIDInfoBlock({ title, description, bulletPoints, ctaText, ctaLink, infoLink = null }) {
  return (
    <Flex direction="column" gap={2} p={6} rounded="sm" borderWidth={1} borderColor="border.light">
      <Heading as="h3" m={0}>
        {title}
      </Heading>
      <Text fontSize="sm">{description}</Text>
      <UnorderedList fontSize="sm" pl={2}>
        {bulletPoints.map((p) => (
          <ListItem>{p}</ListItem>
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
