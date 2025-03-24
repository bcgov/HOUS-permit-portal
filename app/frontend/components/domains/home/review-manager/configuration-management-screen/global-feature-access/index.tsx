import { Box, Container, Flex, Heading, LinkOverlay, Table, Tbody, Td, Text, Tr, VStack } from "@chakra-ui/react"
import { ArrowRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { RouterLinkButton } from "../../../../../shared/navigation/router-link-button"

export const ReviewManagerGlobalFeatureAccessScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.globalFeatureAccess"
  const { t } = useTranslation()
  const { currentJurisdiction } = useJurisdiction()
  const [submissionInboxState, setSubmissionInboxState] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  useEffect(() => {
    setSubmissionInboxState(currentJurisdiction?.inboxEnabled)
  })

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h1">{t(`${i18nPrefix}.title`)}</Heading>
            <Text color="text.secondary" my={6} fontSize={18}>
              {t(`${i18nPrefix}.description`)}
            </Text>
          </Box>
        </Flex>
      </VStack>
      <Box w="full">
        <Table variant="simple">
          <Tbody>
            <Tr
              borderTop="none"
              style={{ borderBottom: "1px solid var(--chakra-colors-border-light)" }}
              _hover={{ color: "var(--chakra-colors-text-link)" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Td width="1000px">
                <Text>{t(`${i18nPrefix}.submissionInbox`)}</Text>
              </Td>
              <Td width="80px">
                <Text fontWeight="bold" textAlign="end" color="black" textDecoration="none">
                  {t(`${i18nPrefix}.toggle${submissionInboxState ? "On" : "Off"}`)}
                </Text>
              </Td>
              <Td width="50px" paddingLeft="0">
                <LinkOverlay
                  as={RouterLinkButton}
                  to="submission-inbox"
                  variant="link"
                  textDecoration="none"
                  position="relative"
                >
                  <ArrowRight color={isHovered ? "#1A5A96" : "black"} size={20} />
                </LinkOverlay>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Container>
  )
})
