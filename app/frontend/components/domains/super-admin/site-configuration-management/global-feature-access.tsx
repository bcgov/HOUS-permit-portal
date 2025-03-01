import { Box, Container, Divider, Flex, Heading, HStack, LinkOverlay, Table, Tbody, Td, Text, Thead, Tr, VStack } from "@chakra-ui/react"
import { ArrowRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

export const AdminGlobalFeatureAccessScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const [submissionInboxState, setSubmissionInboxState] = useState(false)
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    setSubmissionInboxState(siteConfigurationStore?.inboxEnabled)
  })

  return (
    <Container maxW="container.lg" p={8} as={"main"} py={8} flexGrow={1}>
      <Box w="full">
        <Heading as="h1" pt={3}>{t(`${i18nPrefix}.title`)}</Heading>
        <Text color="text.secondary" my={6}>
          {t(`${i18nPrefix}.description`)}
        </Text>
      </Box>
      <Box w="full">
        <Table variant="simple">
          <Tbody>
            <Tr borderTop="none" style={{ borderBottom: "1px solid #D9D9D9" }}>
              <Td width="1000px" _hover={{ color: '#1A5A96' }} >
                <Text>{t(`${i18nPrefix}.submissionInbox`)}</Text>
              </Td>
              <Td width="80px">
                <Text fontWeight="bold" textAlign="end"  color="black" textDecoration="none">
                  {submissionInboxState === false ? t(`${i18nPrefix}.toggleOff`) : t(`${i18nPrefix}.toggleOn`)}
                </Text>
              </Td>
              <Td width="50px" paddingLeft="0">
                <LinkOverlay
                as={RouterLinkButton}
                to="submission-inbox"
                variant="link"
                textDecoration="none"
                position="relative"
                onMouseEnter={() => setIsHovered(true)} 
                onMouseLeave={() => setIsHovered(false)}
                >
                  <ArrowRight 
                    color={isHovered ? '#1A5A96' : 'black'} 
                    size={20} 
                  />
                </LinkOverlay>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
      <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
        <VStack justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Flex direction="row" justify="space-between" w="100%">
          
          </Flex>
        </VStack>
      </Flex>
    </Container>
  )
})
