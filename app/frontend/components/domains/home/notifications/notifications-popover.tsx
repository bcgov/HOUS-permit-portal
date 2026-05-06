import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  IconButtonProps,
  List,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react"
import { Bell, BellRinging, CaretDown, CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNotificationPopover } from "../../../../hooks/use-notification-popover"
import { useMst } from "../../../../setup/root"
import { EFileUploadAttachmentType, ENotificationActionType } from "../../../../types/enums"
import { IReportDocumentNotificationObjectData } from "../../../../types/types"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { FileDownloadButton } from "../../../shared/base/file-download-button"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

interface INotificationsPopoverProps extends IconButtonProps {}

export const NotificationsPopover: React.FC<INotificationsPopoverProps> = observer(function NotificationsPopover({
  ...rest
}) {
  const { notificationStore, sandboxStore } = useMst()
  const { notifications, initialFetch, fetchNotifications, anyUnread, generateSpecificLinkData, getSemanticKey } =
    notificationStore

  useEffect(() => {
    initialFetch()
  }, [])

  const { isOpen, handleOpen, handleClose, numberJustRead, showRead, setShowRead } = useNotificationPopover()

  const { t } = useTranslation()

  const notificationsToShow = showRead ? notifications : notifications.slice(0, numberJustRead)

  // Default renderer: list of navigation links
  const renderLinks = (n) => (
    <List.Root as="ul" pl={0} mb={0}>
      {generateSpecificLinkData(n)?.map((link) => (
        <List.Item whiteSpace={"normal"} key={link.href}>
          <RouterLinkButton
            variant="link"
            rightIcon={<CaretRight />}
            to={link.href}
            color="text.primary"
            onClick={handleClose}
            whiteSpace={"normal"}
            wordBreak={"break-word"}
          >
            {link.text}
          </RouterLinkButton>
        </List.Item>
      ))}
    </List.Root>
  )

  // Map of actionType -> renderer
  const notificationRenderers: Partial<Record<ENotificationActionType, (n) => React.ReactNode>> = {
    [ENotificationActionType.stepCodeReportGenerated]: (n) => (
      <Box onClick={handleClose}>
        <FileDownloadButton
          variant="link"
          modelType={EFileUploadAttachmentType.ReportDocument}
          document={
            {
              id: (n.objectData as IReportDocumentNotificationObjectData)?.reportDocumentId,
              file: {
                metadata: { filename: (n.objectData as IReportDocumentNotificationObjectData)?.filename },
              },
            } as any
          }
          simpleLabel
        />
      </Box>
    ),
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(e) => {
        if (e.open) {
          handleOpen()
        } else {
          handleClose()
        }
      }}
    >
      <Popover.Trigger asChild>
        <Box position="relative">
          <IconButton variant="ghost" aria-label="open notifications" zIndex={1} {...rest}>
            {anyUnread ? <BellRinging size={24} /> : <Bell size={24} />}
          </IconButton>
          {anyUnread && (
            <Box
              position="absolute"
              top={0}
              right={0}
              bg="error"
              borderRadius="full"
              h={3}
              w={3}
              border="1px solid"
              borderColor="greys.white"
            />
          )}
        </Box>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content color="black" w={500} p={4}>
            <Popover.Arrow />
            <Popover.CloseTrigger mt={1} />
            <Popover.Title mb={4}>
              <Flex gap={4}>
                <Heading as="h3" fontSize="lg" mb={0}>
                  {t("notification.title")}
                </Heading>
                {numberJustRead > 0 && (
                  <Badge fontWeight="normal" textTransform="lowercase">
                    {t("notification.nUnread", { n: 3 })}
                  </Badge>
                )}
              </Flex>
            </Popover.Title>
            <Popover.Body p={0} maxH="50vh" overflow="auto">
              <Flex direction="column" gap={4}>
                {R.isEmpty(notificationsToShow) ? (
                  <Text color="greys.grey01">{t("notification.noUnread")}</Text>
                ) : (
                  notificationsToShow?.map((n) => (
                    <CustomMessageBox status={getSemanticKey(n)} description={n.actionText} key={n.id}>
                      {(notificationRenderers[n.actionType] || renderLinks)(n)}
                    </CustomMessageBox>
                  ))
                )}
              </Flex>
            </Popover.Body>
            <Popover.Footer border={0} p={0} pt={2}>
              <Button variant="ghost" onClick={showRead ? fetchNotifications : () => setShowRead(true)}>
                <CaretDown />
                {t("ui.seeMore")}
              </Button>
            </Popover.Footer>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
})
