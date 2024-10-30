import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  HStack,
  Heading,
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
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IEarlyAccessPreview } from "../../../models/early-access-preview"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { EPreviewStatus } from "../../../types/enums"
import { urlForPath } from "../../../utils/utility-functions"
import { CopyLinkButton } from "../../shared/base/copy-link-button"
import PreviewStatusTag from "../../shared/early-access/preview-status-tag"
import { RoleTag } from "../../shared/user/role-tag"

interface ISharePreviewPopoverProps {
  earlyAccessRequirementTemplate: IRequirementTemplate
}

export const SharePreviewPopover: React.FC<ISharePreviewPopoverProps> = ({ earlyAccessRequirementTemplate: rt }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  const [isInviting, setIsInviting] = useState(false)

  const earlyAccessPreviews = rt.earlyAccessPreviews

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      emails: "",
    },
  })

  const onSubmit = (data: { emails: string }) => {
    const emailArray = data.emails.split(",").map((email) => email.trim())
    rt.invitePreviewersByEmail(emailArray)
    reset()
    setIsInviting(false)
  }

  return (
    <Box>
      <Popover isOpen={isOpen} onClose={onClose}>
        <PopoverTrigger>
          <Button variant="link" onClick={onOpen}>
            {t("earlyAccessRequirementTemplate.index.sharePreviewLink", { n: rt.numberOfPreviewers?.toString() })}
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
                    <CopyLinkButton value={urlForPath(`/early-access/requirement-templates/${rt.id}`)} />
                    <Button variant="primary" leftIcon={<Plus />} onClick={() => setIsInviting(true)}>
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
            ) : !R.isEmpty(earlyAccessPreviews) ? (
              earlyAccessPreviews.map((eap) => <PreviewCard key={eap.id} earlyAccessPreview={eap} />)
            ) : (
              <Box color="greys.grey01">{t("earlyAccessRequirementTemplate.index.noPreviewersYet")}</Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
}

interface PreviewCardProps {
  earlyAccessPreview: IEarlyAccessPreview
}

const PreviewCard: React.FC<PreviewCardProps> = observer(({ earlyAccessPreview }) => {
  const { t } = useTranslation()
  const previewer = earlyAccessPreview.previewer
  const status = earlyAccessPreview.status
  const { name, role, organization } = previewer

  const cardRef = useRef()

  const handleRevoke = (e) => {
    earlyAccessPreview.revoke()
  }
  const handleUnrevoke = (e) => {
    earlyAccessPreview.unrevoke()
  }
  const handleExtend = (e) => {
    earlyAccessPreview.extend()
  }

  return (
    <Flex
      p={2}
      borderBottom="1px solid"
      borderColor="gray.200"
      align="center"
      justify="space-between"
      width="full"
      ref={cardRef}
    >
      <PreviewStatusTag earlyAccessPreview={earlyAccessPreview} />
      <VStack spacing={0} align="flex-start" flex="1" ml={3}>
        <Text size="lg" color="text.link" fontWeight="bold">
          {name}
        </Text>
        <Box fontSize="sm">
          <RoleTag role={role} /> {organization}
        </Box>
      </VStack>
      {(status === EPreviewStatus.invited || status === EPreviewStatus.access) && (
        <Button variant="link" color="semantic.error" size="sm" onClick={handleRevoke}>
          {t("earlyAccessRequirementTemplate.index.revokeButton")}
        </Button>
      )}
      {status === EPreviewStatus.expired && (
        <Button variant="link" size="sm" onClick={handleExtend}>
          {t("earlyAccessRequirementTemplate.index.extendButton")}
        </Button>
      )}
      {status === EPreviewStatus.revoked && (
        <Button variant="link" size="sm" onClick={handleUnrevoke}>
          {t("earlyAccessRequirementTemplate.index.unrevokeButton")}
        </Button>
      )}
    </Flex>
  )
})
