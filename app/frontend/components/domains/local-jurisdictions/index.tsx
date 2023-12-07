import { Flex } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface ILocalJurisdictionIndexScreenProps {}

export const LocalJurisdictionIndexScreen = ({}: ILocalJurisdictionIndexScreenProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" w="full" bg="greys.white">
      TODO: ability to list and search local jursdicitions?
    </Flex>
  )
}
