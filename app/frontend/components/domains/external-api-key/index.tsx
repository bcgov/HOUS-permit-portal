import { Box, Container, Flex, Heading, HStack, StackProps, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateFormat } from "../../../constants"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ExternalApiKeyStatusTag } from "./external-api-key-status-tag"
import { GridHeaders } from "./grid-header"

interface IProps extends Partial<StackProps> {}

export const ExternalApiKeysIndexScreen = observer(function ExternalApiKeysIndexScreen({ ...containerProps }: IProps) {
  const { currentJurisdiction, error } = useJurisdiction()
  const [isFetching, setIsFetching] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (currentJurisdiction) {
      ;(async () => {
        setIsFetching(true)

        await currentJurisdiction.fetchExternalApiKeys()

        setIsFetching(false)
      })()
    }
  }, [currentJurisdiction])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  const externalApiKeys = currentJurisdiction.externalApiKeys

  return (
    <Container maxW="container.lg" p={8} as={"main"} h={"full"} w={"full"} {...containerProps}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h1">{currentJurisdiction?.qualifiedName}</Heading>
          </Box>
          <RouterLinkButton alignSelf="flex-end" to={"invite"}>
            {t("externalApiKey.index.createExternalApiKey")}
          </RouterLinkButton>
        </Flex>
        <SearchGrid templateColumns="1fr max(200px) repeat(3, 1fr) 85px" pos={"relative"}>
          <GridHeaders />

          {isFetching ? (
            <Flex py={50} gridColumn={"span 6"}>
              <SharedSpinner />
            </Flex>
          ) : (
            externalApiKeys.map((externalApiKey) => {
              return (
                <Box key={externalApiKey.id} role={"row"} display={"contents"}>
                  <SearchGridItem fontWeight={700} minW="250px">
                    {externalApiKey.name}
                  </SearchGridItem>
                  <SearchGridItem maxW="200px">
                    <HStack flexWrap={"wrap"} maxW={"full"} alignSelf={"middle"}>
                      <ExternalApiKeyStatusTag status={externalApiKey.status} />
                    </HStack>
                  </SearchGridItem>
                  <SearchGridItem>{format(externalApiKey.createdAt, datefnsTableDateFormat)}</SearchGridItem>
                  <SearchGridItem>
                    {externalApiKey.expiredAt && format(externalApiKey.expiredAt, datefnsTableDateFormat)}
                  </SearchGridItem>
                  <SearchGridItem>
                    {externalApiKey.revokedAt && format(externalApiKey.revokedAt, datefnsTableDateFormat)}
                  </SearchGridItem>

                  <SearchGridItem justifyContent={"center"}>
                    <RouterLinkButton to={`/external-api-keys/${externalApiKey.id}/edit`} variant={"link"}>
                      {t("ui.manage")}
                    </RouterLinkButton>
                  </SearchGridItem>
                </Box>
              )
            })
          )}
        </SearchGrid>
      </VStack>
    </Container>
  )
})
