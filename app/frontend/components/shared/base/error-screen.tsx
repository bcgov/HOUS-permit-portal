import { Center, Container, Flex, Text, VStack } from "@chakra-ui/react"
import { Warning } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "../../domains/home"

interface IErrorScreenProps extends IHomeScreenProps {
  error?: Error
}

export const ErrorScreen = ({ error, ...rest }: IErrorScreenProps) => {
  const { t } = useTranslation()

  return (
    <Container as={Flex} direction="column" maxW="container.lg" flexGrow={1}>
      <Center w="full" flex={1} color="greys.grey01">
        <VStack>
          <Warning size={100} />
          {error?.message ? <Text>{error?.message}</Text> : <Text>{t("site.seeConsoleForDetails")}</Text>}
        </VStack>
      </Center>
    </Container>
  )
}
