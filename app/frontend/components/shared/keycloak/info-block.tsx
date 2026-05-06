import { Button, Flex, Heading, Link, List, Text } from "@chakra-ui/react"
import { ArrowSquareOut, CaretRight } from "@phosphor-icons/react"
import React from "react"

export function KeycloakInfoBlock({ title, description, bulletPoints, ctaText, ctaLink, infoLink = null }) {
  return (
    <Flex direction="column" gap={2} p={6}>
      <Heading as="h4" m={0}>
        {title}
      </Heading>
      <Text fontSize="sm">{description}</Text>
      <List.Root as="ul" fontSize="sm" pl={2}>
        {bulletPoints.map((p) => (
          <List.Item key={p}>{p}</List.Item>
        ))}
      </List.Root>
      {infoLink && (
        /* TODO: link to CMS Page */
        <Button variant="plain" asChild>
          <Link href="">
            {infoLink}
            <CaretRight />
          </Link>
        </Button>
      )}
      <Button isExternal variant="secondary" mt={2} asChild>
        <Link href={ctaLink}>
          {ctaText}
          <ArrowSquareOut />
        </Link>
      </Button>
    </Flex>
  )
}
