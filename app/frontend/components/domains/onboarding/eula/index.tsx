import { Box, Button, Flex, Heading, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { LoadingScreen } from "../../../shared/base/loading-screen"

const Editor = React.lazy(() => import("../../../shared/editor/editor").then((module) => ({ default: module.Editor })))

export const EULAScreen = observer(function EULAScreen({ withClose }: { withClose?: boolean }) {
  const { userStore } = useMst()
  const { eula } = userStore
  const navigate = useNavigate()

  const { handleSubmit, formState } = useForm()
  const { isLoading, isValid } = formState

  const onSubmit = async () => {
    await userStore.currentUser.acceptEULA()
  }

  useEffect(() => {
    const fetch = async () => {
      await userStore.fetchEULA()
    }
    !eula && fetch()
  }, [eula])

  const navHeight = document.getElementById("mainNav")?.offsetHeight

  const onClose = () => {
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate(`/profile`)
  }

  return (
    <>
      <VStack direction="column" spacing={8} py={20} w="full" h={`calc(100vh - ${navHeight}px)`}>
        <Heading as="h1" m={0} flex={0} flexBasis="auto">
          {t("eula.title")}
        </Heading>
        <Suspense fallback={<LoadingScreen />}>
          {eula && (
            <>
              <Box maxW="4xl" overflow="hidden" sx={{ ".quill": { height: "100%", overflow: "auto" } }}>
                <Editor value={eula.content} readOnly={true} modules={{ toolbar: false }} />
              </Box>
              {!userStore.currentUser.eulaAccepted && (
                <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 0, flexBasis: "auto" }}>
                  <Button variant="primary" type="submit" isLoading={isLoading} isDisabled={!isValid || isLoading}>
                    {t("eula.accept")}
                  </Button>
                </form>
              )}
            </>
          )}
        </Suspense>
      </VStack>
      {withClose && (
        <Flex
          justify="flex-end"
          w="full"
          bg="greys.grey03"
          position="sticky"
          bottom={0}
          px={4}
          py={2.5}
          zIndex={10}
          borderWidth={1}
          borderColor="border.light"
          shadow="drop"
        >
          <Button variant={"secondary"} onClick={onClose}>
            {t("ui.close")}
          </Button>
        </Flex>
      )}
    </>
  )
})
