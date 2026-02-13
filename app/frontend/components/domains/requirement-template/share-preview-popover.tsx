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
import { IEarlyAccessPreview } from "../../../models/early-access-preview"
import { ITemplateVersion } from "../../../models/template-version"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EPreviewStatus } from "../../../types/enums"
import { urlForPath } from "../../../utils/utility-functions"
import { CopyLinkButton } from "../../shared/base/copy-link-button"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import PreviewStatusTag from "../../shared/early-access/preview-status-tag"
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

    const previews: IEarlyAccessPreview[] = (dtv.templateVersionPreviews as IEarlyAccessPreview[]) ?? []
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
          t("earlyAccessRequirementTemplate.index.inviteToPreviewPartialSuccess"),
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
        {/* Toggle button row */}
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
              {t("earlyAccessRequirementTemplate.index.sharePreviewLink", { n: previewerCount.toString() })}
            </Text>
          </HStack>
          {isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
        </Flex>

        {/* Expandable content */}
        <Collapse in={isOpen} animateOpacity>
          <Box borderTop="1px solid" borderColor="border.light" bg="greys.grey04" px={4} py={3}>
            {isInviting ? (
              /* Invite form */
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight={700}>
                    {t("earlyAccessRequirementTemplate.index.inviteToPreviewTitle")}
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
                      {t("earlyAccessRequirementTemplate.index.inviteToPreviewHint")}
                    </FormHelperText>
                  </FormControl>
                  <Button mt={3} size="sm" type="submit" variant="primary">
                    {t("earlyAccessRequirementTemplate.index.inviteToPreviewButton")}
                  </Button>
                </Box>
              </Box>
            ) : (
              /* Share / previewer list */
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight={700}>
                    {t("earlyAccessRequirementTemplate.index.sharePreviewTitle")}
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
                    {previews.map((eap) => (
                      <PreviewCard key={eap.id} earlyAccessPreview={eap} />
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="greys.grey01" py={1}>
                    {t("earlyAccessRequirementTemplate.index.noPreviewersYet")}
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
  earlyAccessPreview: IEarlyAccessPreview
}

const PreviewCard: React.FC<PreviewCardProps> = observer(({ earlyAccessPreview }) => {
  const { t } = useTranslation()
  const previewer = earlyAccessPreview.previewer
  const status = earlyAccessPreview.status
  const { name, role, organization } = previewer

  const cardRef = useRef()

  const getModalContent = (status: EPreviewStatus) => {
    switch (status) {
      case EPreviewStatus.invited:
      case EPreviewStatus.access:
        return {
          buttonText: t("earlyAccessRequirementTemplate.index.revokeButton"),
          buttonProps: { variant: "link", color: "semantic.error", size: "xs" },
          title: (name: string) => t("earlyAccessRequirementTemplate.index.confirmation.revokeTitle", { name }),
          body: t("earlyAccessRequirementTemplate.index.confirmation.revokeBody"),
          handler: earlyAccessPreview.revoke,
        }
      case EPreviewStatus.expired:
        return {
          buttonText: t("earlyAccessRequirementTemplate.index.extendButton"),
          buttonProps: { variant: "link", size: "xs" },
          title: (name: string) => t("earlyAccessRequirementTemplate.index.confirmation.extendTitle", { name }),
          body: t("earlyAccessRequirementTemplate.index.confirmation.extendBody"),
          handler: earlyAccessPreview.extend,
        }
      case EPreviewStatus.revoked:
        return {
          buttonText: t("earlyAccessRequirementTemplate.index.unrevokeButton"),
          buttonProps: { variant: "link", size: "xs" },
          title: (name: string) => t("earlyAccessRequirementTemplate.index.confirmation.unrevokeTitle", { name }),
          body: t("earlyAccessRequirementTemplate.index.confirmation.unrevokeBody"),
          handler: earlyAccessPreview.unrevoke,
        }
      default:
        return null
    }
  }

  const modalContent = getModalContent(status)

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
      <PreviewStatusTag earlyAccessPreview={earlyAccessPreview} />
      <VStack spacing={0} align="flex-start" flex="1" ml={3}>
        <Text fontSize="sm" color="text.link" fontWeight="bold">
          {name}
        </Text>
        <Box fontSize="xs">
          <RoleTag role={role} /> {organization}
        </Box>
      </VStack>
      {modalContent && (
        <ConfirmationModal
          title={modalContent.title(name)}
          body={modalContent.body}
          triggerText={t("ui.proceed")}
          renderTriggerButton={({ onClick, ...rest }) => (
            <Button {...modalContent.buttonProps} onClick={onClick as (e: React.MouseEvent) => Promise<any>} {...rest}>
              {modalContent.buttonText}
            </Button>
          )}
          onConfirm={(_onClose) => {
            modalContent.handler()
            _onClose()
          }}
          modalContentProps={{
            maxW: "700px",
          }}
        />
      )}
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

    const previews: IEarlyAccessPreview[] = (dtv.templateVersionPreviews as IEarlyAccessPreview[]) ?? []
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
          t("earlyAccessRequirementTemplate.index.inviteToPreviewPartialSuccess"),
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
              {t("earlyAccessRequirementTemplate.index.sharePreviewLink", { n: previewerCount.toString() })}
            </Button>
          </PopoverTrigger>
          <PopoverContent width="lg">
            <PopoverArrow />
            <PopoverHeader p={4}>
              <Flex justify="space-between" align="center">
                {isInviting ? (
                  <>
                    <Heading h="fit-content" mb={0}>
                      {t("earlyAccessRequirementTemplate.index.inviteToPreviewTitle")}
                    </Heading>
                    <PopoverCloseButton size="md" onClick={() => setIsInviting(false)} mt={3} mr={3} />
                  </>
                ) : (
                  <>
                    <Heading h="fit-content" mb={0}>
                      {t("earlyAccessRequirementTemplate.index.sharePreviewTitle")}
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
                    <FormHelperText>{t("earlyAccessRequirementTemplate.index.inviteToPreviewHint")}</FormHelperText>
                  </FormControl>
                  <Button my={4} type="submit" variant="primary">
                    {t("earlyAccessRequirementTemplate.index.inviteToPreviewButton")}
                  </Button>
                </Box>
              ) : !R.isEmpty(previews) ? (
                previews.map((eap) => <PreviewCard key={eap.id} earlyAccessPreview={eap} />)
              ) : (
                <Box color="greys.grey01">{t("earlyAccessRequirementTemplate.index.noPreviewersYet")}</Box>
              )}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    )
  }
)
