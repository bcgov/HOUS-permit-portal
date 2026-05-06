import {
  Box,
  Button,
  ButtonProps,
  Collapsible,
  Field,
  Flex,
  HStack,
  Heading,
  IconButton,
  Popover,
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
    const { open, onToggle } = useDisclosure()
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
          w="full"
          py={2}
          px={4}
          align="center"
          justify="space-between"
          cursor="pointer"
          borderTop="1px solid"
          borderColor="border.light"
          bg={open ? "greys.grey04" : "transparent"}
          _hover={{ bg: "greys.grey04" }}
          transition="background 0.15s"
          asChild
        >
          <button onClick={onToggle}>
            <HStack gap={2}>
              <Text fontSize="sm" fontWeight={600}>
                {t("templateVersionPreview.sharing.sharePreviewLink", { n: previewerCount.toString() })}
              </Text>
            </HStack>
            {open ? <CaretUp size={16} /> : <CaretDown size={16} />}
          </button>
        </Flex>
        <Collapsible.Root open={open}>
          <Collapsible.Content>
            <Box borderTop="1px solid" borderColor="border.light" bg="greys.grey04" px={4} py={3}>
              {isInviting ? (
                <Box>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="sm" fontWeight={700}>
                      {t("templateVersionPreview.sharing.inviteToPreviewTitle")}
                    </Text>
                    <IconButton aria-label="Cancel" size="xs" variant="ghost" onClick={() => setIsInviting(false)}>
                      <X size={14} />
                    </IconButton>
                  </Flex>
                  <Box asChild>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <Field.Root>
                        <Controller
                          name="emails"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              minH="100px"
                              size="sm"
                              bg="white"
                              placeholder="email1@example.com, email2@example.com"
                            />
                          )}
                        />
                        <Field.HelperText fontSize="xs">
                          {t("templateVersionPreview.sharing.inviteToPreviewHint")}
                        </Field.HelperText>
                      </Field.Root>
                      <Button mt={3} size="sm" type="submit" variant="primary">
                        {t("templateVersionPreview.sharing.inviteToPreviewButton")}
                      </Button>
                    </form>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="sm" fontWeight={700}>
                      {t("templateVersionPreview.sharing.sharePreviewTitle")}
                    </Text>
                    <HStack gap={2}>
                      <CopyLinkButton value={shareUrl} />
                      <Button variant="primary" size="xs" onClick={() => setIsInviting(true)}>
                        <Plus size={12} />
                        {t("ui.invite")}
                      </Button>
                    </HStack>
                  </Flex>

                  {!R.isEmpty(previews) ? (
                    <VStack gap={0} align="stretch" maxH="200px" overflowY="auto">
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
          </Collapsible.Content>
        </Collapsible.Root>
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
      <VStack gap={0} align="flex-start" flex="1" ml={3}>
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
          <Button variant="plain" size="sm" onClick={onOpen}>
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
    const { open, onOpen, onClose } = useDisclosure()
    const { t } = useTranslation()
    const [isInviting, setIsInviting] = useState(false)
    const { uiStore } = useMst()

    const previews: ITemplateVersionPreview[] = (dtv.templateVersionPreviews as ITemplateVersionPreview[]) ?? []
    const previewerCount = previews.length

    const shareUrl = urlForPath(`/template-versions/${dtv.id}/preview`)

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
        <Popover.Root
          open={open}
          onOpenChange={(e) => {
            if (e.open) {
            } else {
              onClose()
            }
          }}
        >
          <Popover.Trigger asChild>
            <Button variant="plain" onClick={onOpen} {...rest}>
              {t("templateVersionPreview.sharing.sharePreviewLink", { n: previewerCount.toString() })}
            </Button>
          </Popover.Trigger>
          <Popover.Positioner>
            <Popover.Content width="lg">
              <Popover.Arrow />
              <Popover.Title p={4}>
                <Flex justify="space-between" align="center">
                  {isInviting ? (
                    <>
                      <Heading h="fit-content" mb={0}>
                        {t("templateVersionPreview.sharing.inviteToPreviewTitle")}
                      </Heading>
                      <Popover.CloseTrigger size="md" onClick={() => setIsInviting(false)} mt={3} mr={3} />
                    </>
                  ) : (
                    <>
                      <Heading h="fit-content" mb={0}>
                        {t("templateVersionPreview.sharing.sharePreviewTitle")}
                      </Heading>
                      <HStack>
                        <CopyLinkButton value={shareUrl} />
                        <Button variant="primary" onClick={() => setIsInviting(true)}>
                          <Plus size={14} />
                          {t("ui.invite")}
                        </Button>
                      </HStack>
                    </>
                  )}
                </Flex>
              </Popover.Title>
              <Popover.Body maxH="300px" overflowY="auto">
                {isInviting ? (
                  <Box asChild>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <Field.Root>
                        <Controller
                          name="emails"
                          control={control}
                          render={({ field }) => <Textarea {...field} minH="150px" size="sm" />}
                        />
                        <Field.HelperText>{t("templateVersionPreview.sharing.inviteToPreviewHint")}</Field.HelperText>
                      </Field.Root>
                      <Button my={4} type="submit" variant="primary">
                        {t("templateVersionPreview.sharing.inviteToPreviewButton")}
                      </Button>
                    </form>
                  </Box>
                ) : !R.isEmpty(previews) ? (
                  previews.map((preview) => <PreviewCard key={preview.id} templateVersionPreview={preview} />)
                ) : (
                  <Box color="greys.grey01">{t("templateVersionPreview.sharing.noPreviewersYet")}</Box>
                )}
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Root>
      </Box>
    )
  }
)
