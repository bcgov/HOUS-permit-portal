import { Dialog, Portal } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IParcelGeometry, TLatLngTuple } from "../../../types/types"
import { ProjectMap } from "./project-map"

interface IFullscreenMapModalProps {
  isOpen?: boolean
  open?: boolean
  onClose: () => void
  coordinates: TLatLngTuple | null
  pid?: string | null
  parcelGeometry?: IParcelGeometry | null
  address?: string | null
}

export const FullscreenMapModal = ({
  isOpen,
  open,
  onClose,
  coordinates,
  pid,
  parcelGeometry,
  address,
}: IFullscreenMapModalProps) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root
      open={open ?? isOpen}
      size="full"
      scrollBehavior="inside"
      onOpenChange={(e) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop zIndex={1600} />
        <Dialog.Positioner>
          <Dialog.Content
            m={0}
            borderRadius={0}
            h="100vh"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            zIndex={1600}
            containerProps={{ zIndex: 1600 }}
          >
            <Dialog.Header borderBottomWidth="1px" py={3} flexShrink={0}>
              {address || t("permitProject.map.fullscreenTitle")}
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body p={0} flex={1} overflow="hidden">
              <ProjectMap coordinates={coordinates} pid={pid} parcelGeometry={parcelGeometry} />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
