import { Center, Container, Flex, Text, VStack } from "@chakra-ui/react"
import { LinkBreak } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "../../domains/home"

interface INotFoundScreenProps extends IHomeScreenProps {}

export const NotFoundScreen = ({ ...rest }: INotFoundScreenProps) => {
  const { t } = useTranslation()

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
}
