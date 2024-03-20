import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMst } from "../../../setup/root"
import { LoadingScreen } from "../base/loading-screen"
import { Editor } from "../editor/editor"

export const EULAModal = observer(function EULAModel() {
  const { sessionStore, userStore } = useMst()
  const { loggedIn } = sessionStore
  const { currentUser, eula } = userStore
  const { onClose, isOpen, onOpen } = useDisclosure()

  const { handleSubmit, formState } = useForm()
  const { isLoading, isValid } = formState

  const onSubmit = async () => {
    const result = await userStore.currentUser.acceptEULA()
    result && onClose()
  }

  useEffect(() => {
    loggedIn && !currentUser.isSuperAdmin && !currentUser.eulaAccepted && onOpen()
  }, [loggedIn, currentUser?.eulaAccepted])

  useEffect(() => {
    const fetch = async () => {
      await userStore.fetchEULA()
    }
    isOpen && !eula && fetch()
  }, [isOpen, eula])

  return (
    <Modal
      size={"2xl"}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      scrollBehavior={"inside"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <Suspense fallback={<LoadingScreen />}>
          {eula && (
            <>
              <ModalHeader>{t("eula.title")}</ModalHeader>
              <ModalBody>
                <Editor value={eula.content} readOnly={true} modules={{ toolbar: false }} />
              </ModalBody>
              <ModalFooter>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Button variant="primary" type="submit" isLoading={isLoading} isDisabled={!isValid || isLoading}>
                    {t("eula.accept")}
                  </Button>
                </form>
              </ModalFooter>
            </>
          )}
        </Suspense>
      </ModalContent>
    </Modal>
  )
})
