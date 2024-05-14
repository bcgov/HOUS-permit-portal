import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  IconButtonProps,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  useDisclosure,
} from "@chakra-ui/react"
import { Bell, BellRinging, CaretDown, CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { HStack } from "../../step-code/checklist/pdf-content/shared/h-stack"

interface INotificationsPopoverProps extends IconButtonProps {}

export const NotificationsPopover: React.FC<INotificationsPopoverProps> = observer(({ ...rest }) => {
  const { notificationStore } = useMst()
  const {
    notifications,
    initialFetch,
    fetchNotifications,
    anyUnread,
    unreadNotificationsCount,
    markAllAsRead,
    generateSpecificHref,
  } = notificationStore

  const [numberJustRead, setNumberJustRead] = useState<number>()
  useEffect(() => {
    initialFetch()
  }, [])

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { t } = useTranslation()

  const handleOpen = () => {
    onOpen()
    setNumberJustRead(unreadNotificationsCount)
    markAllAsRead()
  }

  return (
    <Popover isOpen={isOpen} onOpen={handleOpen} onClose={onClose}>
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
            <HStack gap={4}>
              <Heading as="h3" fontSize="lg" mb={0}>
                {t("notification.title")}
              </Heading>
              {numberJustRead > 0 && (
                <Badge fontWeight="normal" textTransform="lowercase">
                  {t("notification.nUnread", { n: numberJustRead })}
                </Badge>
              )}
            </HStack>
          </PopoverHeader>
          <PopoverBody p={4} maxH="50vh" overflow="auto">
            <Flex direction="column" gap={4}>
              {notifications.map((n) => (
                <CustomMessageBox status="info" description={n.actionText} key={n.id}>
                  <RouterLinkButton
                    variant="link"
                    rightIcon={<CaretRight />}
                    to={generateSpecificHref(n)}
                    color="text.primary"
                    onClick={onClose}
                  >
                    {t("ui.go")}
                  </RouterLinkButton>
                </CustomMessageBox>
              ))}
            </Flex>
          </PopoverBody>
          <PopoverFooter border={0} padding={2}>
            <Button variant="ghost" leftIcon={<CaretDown />} onClick={fetchNotifications}>
              {t("ui.showOlder")}
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Portal>
    </Popover>
  )
})
