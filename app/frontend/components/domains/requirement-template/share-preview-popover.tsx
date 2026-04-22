import {
  Box,
  Button,
  ButtonProps,
  Collapse,
  Flex,
  FormControl,
  FormHelperText,
  HStack,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  Textarea,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretDown, CaretUp, Plus, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ITemplateVersion } from "../../../models/template-version"
import { ITemplateVersionPreview } from "../../../models/template-version-preview"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EPreviewStatus } from "../../../types/enums"
import { urlForPath } from "../../../utils/utility-functions"
import { CopyLinkButton } from "../../shared/base/copy-link-button"
import { ConfirmationModal } from "../../shared/modals/confirmation-modal"
import PreviewStatusTag from "../../shared/template-version-preview/preview-status-tag"
import { RoleTag } from "../../shared/user/role-tag"

interface ISharePreviewAccordionProps {
  draftTemplateVersion: ITemplateVersion
}

export const SharePreviewAccordion: React.FC<ISharePreviewAccordionProps> = observer(
  ({ draftTemplateVersion: dtv }) => {
    const { isOpen, onToggle } = useDisclosure()
    const { t } = useTranslation()
    const [isInviting, setIsInviting] = useState(false)
    const { uiStore } = useMst()

    const previews: ITemplateVersionPreview[] = (dtv.templateVersionPreviews as ITemplateVersionPreview[]) ?? []
    const previewerCount = previews.length

    const shareUrl = urlForPath(`/template-versions/${dtv.id}`)

    const { handleSubmit, control, reset } = useForm({
      defaultValues: {
        emails: "",
      },
    })

    const onSubmit = async (data: { emails: string }) => {
      const emailArray = data.emails.split(",").map((email) => email.trim())

      const response = await dtv.inviteDraftPreviewersByEmail(emailArray)
      if (response?.failedEmails?.length > 0) {
        const markdownList = response.failedEmails.map((fe: any) => `- ${fe.email} **(${fe.error})**`).join("\n")
        uiStore.flashMessage.show(
          EFlashMessageStatus.warning,
          t("templateVersionPreview.sharing.inviteToPreviewPartialSuccess"),
          markdownList,
          30000,
          true
        )
      }

      reset()
      setIsInviting(false)
    }

    return (
      <Box w="full">
        <Flex
          as="button"
          onClick={onToggle}
          w="full"
          py={2}
          px={4}
          align="center"
          justify="space-between"
          cursor="pointer"
          borderTop="1px solid"
          borderColor="border.light"
          bg={isOpen ? "greys.grey04" : "transparent"}
          _hover={{ bg: "greys.grey04" }}
          transition="background 0.15s"
        >
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight={600}>
              {t("templateVersionPreview.sharing.sharePreviewLink", { n: previewerCount.toString() })}
            </Text>
          </HStack>
          {isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <Box borderTop="1px solid" borderColor="border.light" bg="greys.grey04" px={4} py={3}>
            {isInviting ? (
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight={700}>
                    {t("templateVersionPreview.sharing.inviteToPreviewTitle")}
                  </Text>
                  <IconButton
                    aria-label="Cancel"
                    icon={<X size={14} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setIsInviting(false)}
                  />
                </Flex>
                <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                  <FormControl>
                    <Controller
                      name="emails"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          minH="100px"
                          size="sm"
                          bg="white"
                          focusBorderColor="teal.500"
                          placeholder="email1@example.com, email2@example.com"
                        />
                      )}
                    />
                    <FormHelperText fontSize="xs">
                      {t("templateVersionPreview.sharing.inviteToPreviewHint")}
                    </FormHelperText>
                  </FormControl>
                  <Button mt={3} size="sm" type="submit" variant="primary">
                    {t("templateVersionPreview.sharing.inviteToPreviewButton")}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight={700}>
                    {t("templateVersionPreview.sharing.sharePreviewTitle")}
                  </Text>
                  <HStack spacing={2}>
                    <CopyLinkButton value={shareUrl} />
                    <Button
                      variant="primary"
                      size="xs"
                      leftIcon={<Plus size={12} />}
                      onClick={() => setIsInviting(true)}
                    >
                      {t("ui.invite")}
                    </Button>
                  </HStack>
                </Flex>

                {!R.isEmpty(previews) ? (
                  <VStack spacing={0} align="stretch" maxH="200px" overflowY="auto">
                    {previews.map((preview) => (
                      <PreviewCard key={preview.id} templateVersionPreview={preview} />
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="greys.grey01" py={1}>
                    {t("templateVersionPreview.sharing.noPreviewersYet")}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    )
  }
)

interface PreviewCardProps {
  templateVersionPreview: ITemplateVersionPreview
}

const PreviewCard: React.FC<PreviewCardProps> = observer(({ templateVersionPreview }) => {
  const previewer = templateVersionPreview.previewer
  const { name, role, organization } = previewer
  const { t } = useTranslation()

  const cardRef = useRef()

  const getModalContent = () => {
    switch (templateVersionPreview.status) {
      case EPreviewStatus.revoked:
        return {
          action: () => templateVersionPreview.unrevoke(),
          buttonLabel: t("templateVersionPreview.sharing.unrevokeButton"),
          promptHeader: t("templateVersionPreview.sharing.confirmation.unrevokeTitle", { name }),
          promptMessage: t("templateVersionPreview.sharing.confirmation.unrevokeBody"),
        }
      case EPreviewStatus.expired:
        return {
          action: () => templateVersionPreview.extend(),
          buttonLabel: t("templateVersionPreview.sharing.extendButton"),
          promptHeader: t("templateVersionPreview.sharing.confirmation.extendTitle", { name }),
          promptMessage: t("templateVersionPreview.sharing.confirmation.extendBody"),
        }
      case EPreviewStatus.invited:
      case EPreviewStatus.access:
      default:
        return {
          action: () => templateVersionPreview.revoke(),
          buttonLabel: t("templateVersionPreview.sharing.revokeButton"),
          promptHeader: t("templateVersionPreview.sharing.confirmation.revokeTitle", { name }),
          promptMessage: t("templateVersionPreview.sharing.confirmation.revokeBody"),
        }
    }
  }

  const { action, buttonLabel, promptHeader, promptMessage } = getModalContent()

  return (
    <Flex
      py={2}
      borderBottom="1px solid"
      borderColor="gray.200"
      align="center"
      justify="space-between"
      width="full"
      ref={cardRef}
    >
      <PreviewStatusTag templateVersionPreview={templateVersionPreview} />
      <VStack spacing={0} align="flex-start" flex="1" ml={3}>
        <Text fontSize="sm" color="text.link" fontWeight="bold">
          {name}
        </Text>
        <Box fontSize="xs">
          <RoleTag role={role} /> {organization}
        </Box>
      </VStack>
      <ConfirmationModal
        onConfirm={action}
        promptHeader={promptHeader}
        promptMessage={promptMessage}
        confirmText={buttonLabel}
        renderTrigger={(onOpen) => (
          <Button variant="link" size="sm" onClick={onOpen}>
            {buttonLabel}
          </Button>
        )}
      />
    </Flex>
  )
})

/* ------------------------------------------------------------------ */
/*  SharePreviewPopover – button + popover for standalone page header  */
/* ------------------------------------------------------------------ */

interface ISharePreviewPopoverProps extends ButtonProps {
  draftTemplateVersion: ITemplateVersion
}

export const SharePreviewPopover: React.FC<ISharePreviewPopoverProps> = observer(
  ({ draftTemplateVersion: dtv, ...rest }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { t } = useTranslation()
    const [isInviting, setIsInviting] = useState(false)
    const { uiStore } = useMst()

    const previews: ITemplateVersionPreview[] = (dtv.templateVersionPreviews as ITemplateVersionPreview[]) ?? []
    const previewerCount = previews.length

    const shareUrl = urlForPath(`/template-versions/${dtv.id}`)

    const { handleSubmit, control, reset } = useForm({
      defaultValues: {
        emails: "",
      },
    })

    const onSubmit = async (data: { emails: string }) => {
      const emailArray = data.emails.split(",").map((email) => email.trim())

      const response = await dtv.inviteDraftPreviewersByEmail(emailArray)
      if (response?.failedEmails?.length > 0) {
        const markdownList = response.failedEmails.map((fe: any) => `- ${fe.email} **(${fe.error})**`).join("\n")
        uiStore.flashMessage.show(
          EFlashMessageStatus.warning,
          t("templateVersionPreview.sharing.inviteToPreviewPartialSuccess"),
          markdownList,
          30000,
          true
        )
      }

      reset()
      setIsInviting(false)
    }

    return (
      <Box>
        <Popover isOpen={isOpen} onClose={onClose}>
          <PopoverTrigger>
            <Button variant="link" onClick={onOpen} {...rest}>
              {t("templateVersionPreview.sharing.sharePreviewLink", { n: previewerCount.toString() })}
            </Button>
          </PopoverTrigger>
          <PopoverContent width="lg">
            <PopoverArrow />
            <PopoverHeader p={4}>
              <Flex justify="space-between" align="center">
                {isInviting ? (
                  <>
                    <Heading h="fit-content" mb={0}>
                      {t("templateVersionPreview.sharing.inviteToPreviewTitle")}
                    </Heading>
                    <PopoverCloseButton size="md" onClick={() => setIsInviting(false)} mt={3} mr={3} />
                  </>
                ) : (
                  <>
                    <Heading h="fit-content" mb={0}>
                      {t("templateVersionPreview.sharing.sharePreviewTitle")}
                    </Heading>
                    <HStack>
                      <CopyLinkButton value={shareUrl} />
                      <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setIsInviting(true)}>
                        {t("ui.invite")}
                      </Button>
                    </HStack>
                  </>
                )}
              </Flex>
            </PopoverHeader>

            <PopoverBody maxH="300px" overflowY="auto">
              {isInviting ? (
                <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                  <FormControl>
                    <Controller
                      name="emails"
                      control={control}
                      render={({ field }) => <Textarea {...field} minH="150px" size="sm" focusBorderColor="teal.500" />}
                    />
                    <FormHelperText>{t("templateVersionPreview.sharing.inviteToPreviewHint")}</FormHelperText>
                  </FormControl>
                  <Button my={4} type="submit" variant="primary">
                    {t("templateVersionPreview.sharing.inviteToPreviewButton")}
                  </Button>
                </Box>
              ) : !R.isEmpty(previews) ? (
                previews.map((preview) => <PreviewCard key={preview.id} templateVersionPreview={preview} />)
              ) : (
                <Box color="greys.grey01">{t("templateVersionPreview.sharing.noPreviewersYet")}</Box>
              )}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    )
  }
)
