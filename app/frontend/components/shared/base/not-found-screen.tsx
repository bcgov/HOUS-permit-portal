import { Box, Container, Heading, Icon, Text, VStack } from "@chakra-ui/react"
import { ListMagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IHomeScreenProps } from "../../domains/home"
import { RouterLink } from "../navigation/router-link"
import { RouterLinkButton } from "../navigation/router-link-button"
import { LoadingScreen } from "./loading-screen"

interface INotFoundScreenProps extends IHomeScreenProps {}

export const NotFoundScreen = observer(({ ...rest }: INotFoundScreenProps) => {
  const { t } = useTranslation()
  const {
    sessionStore: { isLoggingOut },
  } = useMst()

  if (isLoggingOut) return <LoadingScreen />

  return (
    <Container maxW="container.lg">
      <VStack gap="16" my="20" mb="40">
        <Icon as={ListMagnifyingGlass} boxSize="14" color="theme.yellow" />
        <Box>
          <Heading as="h1">{t("site.pageNotFound")}</Heading>
          <Text>{t("site.pageNotFoundInstructions")}</Text>
        </Box>
        <RouterLinkButton to="/">{t("site.pageNotFoundCTA")}</RouterLinkButton>
        <Text>
          {t("site.pageNotFoundContactInstructions")}
          <RouterLink to="/contact" ml="1">
            {t("site.contact")}
          </RouterLink>
        </Text>
      </VStack>
    </Container>
  )
})
