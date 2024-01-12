import { Center, Container, Flex, Text, VStack } from "@chakra-ui/react"
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "../../domains/home"

export const ErrorScreen = ({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()

  return (
    <Container as={Flex} direction="column" maxW="container.lg" flexGrow={1}>
      <Center w="full" flex={1} color="greys.grey02">
        <VStack>
          <FontAwesomeIcon style={{ height: 100, width: 100 }} icon={faTriangleExclamation} />
          <Text>{t("site.somethingWrong")}</Text>
        </VStack>
      </Center>
    </Container>
  )
}
