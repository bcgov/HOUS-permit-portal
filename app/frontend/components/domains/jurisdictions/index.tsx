import { Box, Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { RouterLink } from "../../shared/navigation/router-link"

interface IJurisdictionIndexScreenProps {}

export const JurisdictionIndexScreen = observer(({}: IJurisdictionIndexScreenProps) => {
  const { t } = useTranslation()

  const { jurisdictionStore } = useMst()
  const { fetchJurisdictions, jurisdictions } = jurisdictionStore

  useEffect(() => {
    fetchJurisdictions()
  }, [])

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      jurisdictions index
      {jurisdictions.map((j) => (
        <Box>
          <RouterLink to={`/jurisdictions/${j.id}`}>{j.name}</RouterLink>
        </Box>
      ))}
    </Flex>
  )
})
