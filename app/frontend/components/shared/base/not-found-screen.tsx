import { Center, Container, Flex, Text, VStack } from "@chakra-ui/react"
import { LinkBreak } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IHomeScreenProps } from "../../domains/home"
import { LoadingScreen } from "./loading-screen"

interface INotFoundScreenProps extends IHomeScreenProps {}

export const NotFoundScreen = observer(({ ...rest }: INotFoundScreenProps) => {
  const { t } = useTranslation()
  const {
    sessionStore: { isLoggingOut },
  } = useMst()

  if (isLoggingOut) return <LoadingScreen />

  return (
    <Container as={Flex} direction="column" maxW="container.lg" flexGrow={1}>
      <Center w="full" flex={1} color="greys.grey01">
        <VStack>
          <LinkBreak size={100} />
          <Text>{t("site.pageNotFound")}</Text>
        </VStack>
      </Center>
    </Container>
  )
})
