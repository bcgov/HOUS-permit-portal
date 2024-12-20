import { Center, CenterProps, Container, Flex, Link, Text } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface ICenterContainerProps extends CenterProps {
  children: ReactNode
}

export const CenterContainer = ({ children, ...rest }: ICenterContainerProps) => {
  const { t } = useTranslation()
  return (
    <Flex direction="column" w="full" bg="greys.grey03" flex={1} align="center" justify="space-between">
      <Center as={Container} maxW="container.md" flex={{ base: 0, sm: 1 }} mt={40} mb={20} px={0} {...rest}>
        <Flex direction="column" align="center" justify="space-between">
          {children}
          <Center color="greys.grey90" maxW={600} textAlign="center" mt={20} fontSize="sm">
            <Text fontStyle="italic">
              {t("site.foippaWarning")}
              <Link href={"mailto:" + t("site.contactEmail")} isExternal>
                {t("site.contactEmail")}
              </Link>
            </Text>
          </Center>
        </Flex>
      </Center>
    </Flex>
  )
}
