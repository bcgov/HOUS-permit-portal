import { Box, ButtonGroup, Container, Flex, Heading, Link, StackProps, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Outlet } from "react-router-dom"
import { datefnsTableDateFormat } from "../../../constants"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../setup/root"
import { EJurisdictionExternalApiState } from "../../../types/enums"
import { CalloutBanner } from "../../shared/base/callout-banner"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ExternalApiKeySandboxTag } from "./external-api-key-sandbox-tag"
import { ExternalApiKeyStatusTag } from "./external-api-key-status-tag"
import { GridHeaders } from "./grid-header"

interface IProps extends Partial<StackProps> {}

export const ExternalApiKeysIndexScreen = observer(function ExternalApiKeysIndexScreen({ ...containerProps }: IProps) {
  const { userStore } = useMst()
  const { currentUser } = userStore
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
  if (!currentUser || !currentJurisdiction) return <LoadingScreen />

  const externalApiKeys = currentJurisdiction.externalApiKeys
  const externalApiEnabled = currentJurisdiction.externalApiEnabled
  const disableLinkClick = (e) => !externalApiEnabled && e.preventDefault()

  return (
    <Container maxW="container.lg" p={8} as={"main"} h={"full"} w={"full"} {...containerProps}>
      {/*This outlet will render the create/edit modal*/}
      <Outlet />
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h1">{currentJurisdiction?.qualifiedName}</Heading>
          </Box>
          <ButtonGroup gap={4}>
            {currentUser?.isManager && (
              <RouterLinkButton
                alignSelf={"flex-end"}
                variant={"secondary"}
                to={"/api-settings/api-mappings"}
                isDisabled={!externalApiEnabled}
                onClick={disableLinkClick}
              >
                {t("apiMappingsSetup.title")}
              </RouterLinkButton>
            )}
            <RouterLinkButton
              alignSelf={"flex-end"}
              variant={"primary"}
              to={"create"}
              isDisabled={!externalApiEnabled}
              onClick={disableLinkClick}
            >
              {t("externalApiKey.index.createExternalApiKey")}
            </RouterLinkButton>
          </ButtonGroup>
        </Flex>
        {currentJurisdiction?.externalApiState === EJurisdictionExternalApiState.gOff && currentUser.isManager && (
          <CalloutBanner
            type={"warning"}
            title={
              <>
                {t("externalApiKey.index.disabledWarningTitle")}{" "}
                <Link href={"mailto:" + t("site.contactEmail")} isExternal>
                  {t("site.contactEmail")}
                </Link>
              </>
            }
          />
        )}

        <SearchGrid templateColumns="repeat(7, 1fr) 85px" pos={"relative"}>
          <GridHeaders />

          {isFetching ? (
            <Flex py={50} gridColumn={"span 8"}>
              <SharedSpinner />
            </Flex>
          ) : (
            externalApiKeys.map((externalApiKey) => {
              return (
                <Box key={externalApiKey.id} role={"row"} display={"contents"}>
                  <SearchGridItem fontWeight={700}>{externalApiKey.name}</SearchGridItem>
                  <SearchGridItem>{externalApiKey.connectingApplication}</SearchGridItem>
                  <SearchGridItem>
                    <ExternalApiKeyStatusTag status={externalApiKey.status} />
                  </SearchGridItem>
                  <SearchGridItem>
                    {externalApiKey.statusScope && (
                      <ExternalApiKeySandboxTag statusScope={externalApiKey.statusScope} />
                    )}
                  </SearchGridItem>
                  <SearchGridItem>{format(externalApiKey.createdAt, datefnsTableDateFormat)}</SearchGridItem>
                  <SearchGridItem>
                    {externalApiKey.expiredAt && format(externalApiKey.expiredAt, datefnsTableDateFormat)}
                  </SearchGridItem>
                  <SearchGridItem>
                    {externalApiKey.revokedAt && format(externalApiKey.revokedAt, datefnsTableDateFormat)}
                  </SearchGridItem>

                  <SearchGridItem justifyContent={"center"}>
                    <RouterLinkButton
                      variant={"link"}
                      to={`${externalApiKey.id}/manage`}
                      isDisabled={!externalApiEnabled}
                      onClick={disableLinkClick}
                    >
                      {t("ui.manage")}
                    </RouterLinkButton>
                  </SearchGridItem>
                </Box>
              )
            })
          )}
        </SearchGrid>
      </VStack>
      <CalloutBanner
        type={"info"}
        title={t("externalApiKey.index.apiKeyInfo.title")}
        body={
          <Trans
            i18nKey={"externalApiKey.index.apiKeyInfo.body"}
            components={{
              1: (
                <Link
                  style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}
                  href={"/integrations/api_docs"}
                  target={"_blank"}
                  rel="noopener noreferrer"
                >
                  {t("externalApiKey.index.accessDocs")}
                </Link>
              ),
            }}
          />
        }
      />
    </Container>
  )
})
