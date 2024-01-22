import { Center, Container, Flex, Text, VStack } from "@chakra-ui/react"
import { Warning } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "../../domains/home"

export const ErrorScreen = ({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()

  return (
    <Container as={Flex} direction="column" maxW="container.lg" flexGrow={1}>
      <Center w="full" flex={1} color="greys.grey02">
        <VStack>
          <Warning size={100} />
          <Text>{t("site.somethingWrong")}</Text>
        </VStack>
      </Center>
    </Container>
  )
}
