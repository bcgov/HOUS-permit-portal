import { Box, Container, Divider, Flex, Heading, HStack, LinkOverlay, Text, VStack } from "@chakra-ui/react"
import { ArrowRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../../hooks/use-search"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { useMst } from "../../../../setup/root"

export const AdminGlobalFeatureAccessScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h1">{t(`${i18nPrefix}.title`)}</Heading>
            <Text color="text.secondary" my={6}>
              {t(`${i18nPrefix}.description`)}
            </Text>
          </Box>
        </Flex>
      </VStack>
      <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
        <VStack justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Flex direction="row" justify="space-between" w="100%">
            <Text>{t(`${i18nPrefix}.submissionInbox`)}</Text>
            <HStack spacing={5} align="center">
              <LinkOverlay
                as={RouterLinkButton}
                to="submission-inbox"
                variant="link"
                textDecoration="none"
                position="relative" 
              >
                <HStack spacing={6}> 
                  <Text fontWeight="normal" color="black" textDecoration="none">Off</Text>
                  <ArrowRight color="black" size={16} />
                </HStack>
              </LinkOverlay>
            </HStack>
          </Flex>
          <Divider />
        </VStack>
      </Flex>
    </Container>
  )
})
