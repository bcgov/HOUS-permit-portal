import { Box, Button, Heading, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMst } from "../../../../setup/root"
import { LoadingScreen } from "../../../shared/base/loading-screen"

const Editor = React.lazy(() => import("../../../shared/editor/editor").then((module) => ({ default: module.Editor })))

export const EULAScreen = observer(function EULAScreen() {
  const { userStore } = useMst()
  const { eula } = userStore

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

  return (
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
            <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 0, flexBasis: "auto" }}>
              <Button variant="primary" type="submit" isLoading={isLoading} isDisabled={!isValid || isLoading}>
                {t("eula.accept")}
              </Button>
            </form>
          </>
        )}
      </Suspense>
    </VStack>
  )
})
