import { Flex } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface IJurisdictionIndexScreenProps {}

export const JurisdictionIndexScreen = ({}: IJurisdictionIndexScreenProps) => {
  const { t } = useTranslation()

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      TODO: ability to list and search jursdicitions?
    </Flex>
  )
}
