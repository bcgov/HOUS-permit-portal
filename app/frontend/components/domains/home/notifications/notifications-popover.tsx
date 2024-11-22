import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  IconButtonProps,
  ListItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  UnorderedList,
} from "@chakra-ui/react"
import { Bell, BellRinging, CaretDown, CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNotificationPopover } from "../../../../hooks/use-notification-popover"
import { useMst } from "../../../../setup/root"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

interface INotificationsPopoverProps extends IconButtonProps {}

export const NotificationsPopover: React.FC<INotificationsPopoverProps> = observer(function NotificationsPopover({
  ...rest
}) {
  const { notificationStore } = useMst()
  const { notifications, initialFetch, fetchNotifications, anyUnread, generateSpecificLinkData, getSemanticKey } =
    notificationStore

  useEffect(() => {
    initialFetch()
  }, [])

  const { isOpen, handleOpen, handleClose, numberJustRead, showRead, setShowRead } = useNotificationPopover()

  const { t } = useTranslation()

  const notificationsToShow = showRead ? notifications : notifications.slice(0, numberJustRead)

  return (
    <Popover isOpen={isOpen} onOpen={handleOpen} onClose={handleClose}>
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            variant="ghost"
            icon={anyUnread ? <BellRinging size={24} /> : <Bell size={24} />}
            aria-label="open notifications"
            zIndex={1}
            {...rest}
          />
          {anyUnread && (
            <Badge
              position="absolute"
              top={0}
              right={0}
              bg="error"
              borderRadius="50%"
              h={3}
              w={3}
              border="1px solid"
              borderColor="greys.white"
            />
          )}
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent color="black" w={500}>
          <PopoverArrow />
          <PopoverCloseButton mt={1} />
          <PopoverHeader>
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
          </PopoverHeader>
          <PopoverBody p={4} maxH="50vh" overflow="auto">
            <Flex direction="column" gap={4}>
              {R.isEmpty(notificationsToShow) ? (
                <Text color="greys.grey01">{t("notification.noUnread")}</Text>
              ) : (
                notificationsToShow.map((n) => (
                  <CustomMessageBox status={getSemanticKey(n)} description={n.actionText} key={n.id}>
                    <UnorderedList pl={0} mb={0}>
                      {generateSpecificLinkData(n).map((link) => (
                        <ListItem whiteSpace={"normal"} key={link.href}>
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
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </CustomMessageBox>
                ))
              )}
            </Flex>
          </PopoverBody>
          <PopoverFooter border={0} padding={2}>
            <Button
              variant="ghost"
              leftIcon={<CaretDown />}
              onClick={showRead ? fetchNotifications : () => setShowRead(true)}
            >
              {t("ui.seeMore")}
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Portal>
    </Popover>
  )
})
