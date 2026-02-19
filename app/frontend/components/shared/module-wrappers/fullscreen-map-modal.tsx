import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IParcelGeometry, TLatLngTuple } from "../../../types/types"
import { ProjectMap } from "./project-map"

interface IFullscreenMapModalProps {
  isOpen: boolean
  onClose: () => void
  coordinates: TLatLngTuple | null
  pid?: string | null
  parcelGeometry?: IParcelGeometry | null
  address?: string | null
}

export const FullscreenMapModal = ({
  isOpen,
  onClose,
  coordinates,
  pid,
  parcelGeometry,
  address,
}: IFullscreenMapModalProps) => {
  const { t } = useTranslation()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside">
      <ModalOverlay zIndex={1600} />
      <ModalContent
        m={0}
        borderRadius={0}
        h="100vh"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        zIndex={1600}
        containerProps={{ zIndex: 1600 }}
      >
        <ModalHeader borderBottomWidth="1px" py={3} flexShrink={0}>
          {address || t("permitProject.map.fullscreenTitle")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0} flex={1} overflow="hidden">
          <ProjectMap coordinates={coordinates} pid={pid} parcelGeometry={parcelGeometry} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
