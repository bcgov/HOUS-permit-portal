import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FlexProps,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Export, FileCsv } from "@phosphor-icons/react"
import { Pencil } from "@phosphor-icons/react/dist/ssr"
import { format } from "date-fns"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { ITemplateVersion } from "../../../models/template-version"
import { ETemplateVersionStatus } from "../../../types/enums"
import { RemoveConfirmationModal } from "../../shared/modals/remove-confirmation-modal"
import { RouterLink } from "../../shared/navigation/router-link"
import { TemplateStatusTag } from "../../shared/requirement-template/template-status-tag"
import { VersionTag } from "../../shared/version-tag"
import { SharePreviewAccordion } from "./share-preview-popover"

interface IProps {
  requirementTemplate: IRequirementTemplate
  isOpen?: boolean
  onClose?: () => void
  /** Hide "Open builder" in the drawer when the user is already on the template builder. */
  isInBuilder?: boolean
}

export const TemplateVersionsSidebar = observer(function TemplateVersionsSidebar({
  requirementTemplate,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  isInBuilder = false,
}: IProps) {
  const { isOpen: internalIsOpen, onOpen: internalOnOpen, onClose: internalOnClose } = useDisclosure()
  const btnRef = React.useRef()

  const isOpen = externalIsOpen ?? internalIsOpen
  const onClose = externalOnClose || internalOnClose
  const onOpen = internalOnOpen

  return (
    <>
      {externalIsOpen === undefined && (
        <Button size="sm" variant={"primary"} onClick={onOpen}>
          {t("requirementTemplate.versionSidebar.triggerButton")}
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent maxW="644px" pt="var(--app-navbar-height)">
          <DrawerCloseButton />
          <DrawerHeader mt={4} px={8} borderBottom="1px solid" borderColor={"border.light"}>
            <Text as="h2" fontWeight={700} fontSize={"2xl"}>
              {t("requirementTemplate.versionSidebar.title")}
            </Text>
            <Text
              fontSize={"md"}
              fontWeight={700}
              mt={2}
            >{`${t("requirementTemplate.versionSidebar.subtitlePrefix")} ${requirementTemplate.displayLabel}`}</Text>
          </DrawerHeader>

          <DrawerBody py={10} px={8}>
            <Stack spacing={10}>
              {!requirementTemplate.isDiscarded && (
                <BuilderPanel
                  viewRoute={`/requirement-templates/${requirementTemplate.id}/edit`}
                  updatedAt={requirementTemplate.updatedAt}
                  hideOpenBuilderButton={isInBuilder}
                />
              )}

              <VersionFlow requirementTemplate={requirementTemplate} />

              <VersionsList
                type={ETemplateVersionStatus.deprecated}
                templateVersions={requirementTemplate.lastThreeDeprecatedTemplateVersions}
              />
              {requirementTemplate.publishedTemplateVersion && (
                <Menu>
                  <MenuButton as={Button} aria-label="Options" variant="secondary" rightIcon={<Export />} px={2}>
                    {t("ui.export")}
                  </MenuButton>

                  <MenuList>
                    <MenuItem onClick={requirementTemplate.publishedTemplateVersion.downloadRequirementSummary}>
                      <HStack spacing={2} fontSize={"sm"}>
                        <FileCsv size={24} />
                        <Text as={"span"}>{t("requirementTemplate.export.downloadSummaryCsv")}</Text>
                      </HStack>
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
})

const BuilderPanel = ({
  viewRoute,
  updatedAt,
  hideOpenBuilderButton = false,
}: {
  viewRoute: string
  updatedAt: Date
  hideOpenBuilderButton?: boolean
}) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Text as="h3" fontSize={"xl"} fontWeight={700} mb={2}>
        {t("requirementTemplate.versionSidebar.listTitles.templateBuilder")}
      </Text>
      <Flex
        p={4}
        border={"1px solid"}
        borderColor={"border.light"}
        borderRadius={"sm"}
        bg={"greys.grey04"}
        w="full"
        justifyContent={hideOpenBuilderButton ? "flex-start" : "space-between"}
        alignItems={"center"}
        gap={4}
      >
        <HStack spacing={4}>
          <Flex
            border={"1px solid"}
            borderColor={"border.base"}
            borderRadius={"sm"}
            bg={"greys.white"}
            p={2}
            color={"text.primary"}
          >
            <Pencil />
          </Flex>
          <Box>
            <Text fontWeight={700}>{t("requirementTemplate.versionSidebar.builderTitle")}</Text>
            <Text color={"text.secondary"} fontSize={"sm"}>
              {t("requirementTemplate.versionSidebar.lastUpdated")} {format(updatedAt, "MMM dd, yyyy")}
            </Text>
          </Box>
        </HStack>
        {!hideOpenBuilderButton && (
          <Button as={RouterLink} to={viewRoute} variant={"primary"} size="sm" leftIcon={<Pencil />}>
            {t("translation:requirementTemplate.versionSidebar.openBuilderButton")}
          </Button>
        )}
      </Flex>
    </Box>
  )
}

const VersionFlow = observer(function VersionFlow({
  requirementTemplate,
}: {
  requirementTemplate: IRequirementTemplate
}) {
  const { t } = useTranslation()
  const publishedTemplateVersions = requirementTemplate.publishedTemplateVersion
    ? [requirementTemplate.publishedTemplateVersion]
    : []

  return (
    <Box>
      <Text as="h3" fontSize={"xl"} fontWeight={700} mb={2}>
        {t("requirementTemplate.versionSidebar.flowTitle")}
      </Text>
      <Text color={"text.secondary"} fontSize={"sm"} mb={4}>
        {t("requirementTemplate.versionSidebar.flowDescription")}
      </Text>

      <Stack spacing={0}>
        <VersionFlowStep
          label={t("requirementTemplate.versionSidebar.listTitles.draft")}
          emptyLabel={t("requirementTemplate.versionSidebar.noEarlyAccessVersion")}
          hasContent={!!requirementTemplate.draftTemplateVersion}
        >
          {requirementTemplate.draftTemplateVersion && (
            <Box border="1px solid" borderColor="border.light" borderRadius="sm" overflow="hidden">
              <VersionCard
                viewRoute={`/template-versions/${requirementTemplate.draftTemplateVersion.id}`}
                status={ETemplateVersionStatus.draft}
                updatedAt={requirementTemplate.draftTemplateVersion.updatedAt}
                borderRadius="none"
                border="none"
              />
              <SharePreviewAccordion draftTemplateVersion={requirementTemplate.draftTemplateVersion} />
            </Box>
          )}
        </VersionFlowStep>

        <VersionFlowStep
          label={t("requirementTemplate.versionSidebar.listTitles.scheduled")}
          emptyLabel={t("requirementTemplate.versionSidebar.noScheduledVersion")}
          hasContent={requirementTemplate.scheduledTemplateVersions.length > 0}
        >
          {requirementTemplate.scheduledTemplateVersions.map((templateVersion, index) => (
            <VersionCard
              key={templateVersion.id}
              viewRoute={`/template-versions/${templateVersion.id}`}
              status={ETemplateVersionStatus.scheduled}
              versionDate={templateVersion.versionDate}
              borderTop={index !== 0 ? "none" : undefined}
              borderTopRadius={index === 0 ? "sm" : undefined}
              borderBottomRadius={index === requirementTemplate.scheduledTemplateVersions.length - 1 ? "sm" : undefined}
              borderRadius={"none"}
              onUnschedule={() => requirementTemplate.unscheduleTemplateVersion(templateVersion.id)}
            />
          ))}
        </VersionFlowStep>

        <VersionFlowStep
          label={t("requirementTemplate.versionSidebar.listTitles.published")}
          emptyLabel={t("requirementTemplate.versionSidebar.noPublishedVersion")}
          hasContent={publishedTemplateVersions.length > 0}
          isLast
        >
          {publishedTemplateVersions.map((templateVersion) => (
            <VersionCard
              key={templateVersion.id}
              viewRoute={`/template-versions/${templateVersion.id}`}
              status={ETemplateVersionStatus.published}
              versionDate={templateVersion.versionDate}
            />
          ))}
        </VersionFlowStep>
      </Stack>
    </Box>
  )
})

const VersionFlowStep = ({
  label,
  emptyLabel,
  hasContent,
  isLast,
  children,
}: {
  label: string
  emptyLabel: string
  hasContent: boolean
  isLast?: boolean
  children?: React.ReactNode
}) => {
  return (
    <Flex align="stretch">
      <Flex direction="column" align="center" mr={4} pt={2}>
        <Box w={3} h={3} borderRadius="full" bg="theme.blue" />
        {!isLast && <Box flex={1} borderLeft="1px solid" borderColor="border.base" my={2} />}
      </Flex>
      <Box flex={1} pb={isLast ? 0 : 5}>
        <Text fontWeight={700} mb={2}>
          {label}
        </Text>
        {hasContent ? (
          children
        ) : (
          <Flex p={4} border={"1px dashed"} borderColor={"border.base"} borderRadius={"sm"} bg={"greys.grey04"}>
            <Text color={"text.secondary"} fontSize={"sm"}>
              {emptyLabel}
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  )
}

const VersionsList = observer(function VersionsList({
  type,
  templateVersions,
  onUnschedule,
}: {
  type: Exclude<ETemplateVersionStatus, ETemplateVersionStatus.draft>
  templateVersions: ITemplateVersion[]
  onUnschedule?: (templateVersionId: string) => Promise<boolean>
}) {
  const { t } = useTranslation()

  return (
    <Box>
      <Text as="h3" fontSize={"xl"} fontWeight={700} mb={2}>
        {t(`requirementTemplate.versionSidebar.listTitles.${type}`)}
      </Text>

      {templateVersions.map((templateVersion, index) => (
        <VersionCard
          key={templateVersion.id}
          viewRoute={`/template-versions/${templateVersion.id}`}
          status={type}
          versionDate={templateVersion.versionDate}
          borderTop={index !== 0 ? "none" : undefined}
          borderTopRadius={index === 0 ? "sm" : undefined}
          borderBottomRadius={index === templateVersions.length - 1 ? "sm" : undefined}
          borderRadius={"none"}
          onUnschedule={onUnschedule ? () => onUnschedule(templateVersion.id) : undefined}
          deprecationReasonLabel={templateVersion.deprecationReasonLabel}
        />
      ))}
    </Box>
  )
})

type TVersionCardProps = Partial<FlexProps> & { viewRoute: string; onUnschedule?: () => Promise<boolean> } & (
    | {
        status: Exclude<ETemplateVersionStatus, ETemplateVersionStatus.draft>
        versionDate: Date
        updatedAt?: never
        deprecationReasonLabel?: string
      }
    | {
        status: ETemplateVersionStatus.draft
        versionDate?: never
        updatedAt: Date
        deprecationReasonLabel?: never
      }
  )

const VersionCard = observer(function VersionCard({
  viewRoute,
  onUnschedule,
  status,
  versionDate,
  updatedAt,
  deprecationReasonLabel,
  ...containerProps
}: TVersionCardProps) {
  const { t } = useTranslation()

  const renderTemplateButton = () => {
    if (status === ETemplateVersionStatus.published || status === ETemplateVersionStatus.deprecated) {
      return (
        <Button as={RouterLink} to={viewRoute} variant={"primary"} size="sm">
          {t("ui.view")}
        </Button>
      )
    } else if (status === ETemplateVersionStatus.draft) {
      return (
        <Button as={RouterLink} to={viewRoute} variant={"primary"} size="sm">
          {t("ui.view")}
        </Button>
      )
    } else {
      return (
        <>
          <RemoveConfirmationModal
            title={t("requirementTemplate.versionSidebar.unscheduleWarning.title")}
            body={t("requirementTemplate.versionSidebar.unscheduleWarning.body")}
            renderTriggerButton={(props) => {
              return (
                <Button variant={"secondary"} size="sm" {...props}>
                  {t("translation:requirementTemplate.versionSidebar.unscheduleButton")}
                </Button>
              )
            }}
            onRemove={onUnschedule}
            triggerText={t("translation:requirementTemplate.versionSidebar.unscheduleButton")}
          />
          <Button as={RouterLink} to={viewRoute} variant={"primary"} size="sm" ml="auto">
            {t("ui.view")}
          </Button>
        </>
      )
    }
  }
  return (
    <Flex
      p={4}
      border={"1px solid"}
      borderColor={"border.light"}
      borderRadius={"sm"}
      w="full"
      justifyContent={"space-between"}
      alignItems={"center"}
      gap={4}
      {...containerProps}
    >
      <HStack spacing={16}>
        <TemplateStatusTag
          status={status}
          scheduledFor={status === ETemplateVersionStatus.scheduled && versionDate ? versionDate : undefined}
          subText={status === ETemplateVersionStatus.deprecated ? deprecationReasonLabel : undefined}
        />
        {status === ETemplateVersionStatus.draft ? (
          <Text>
            {t("requirementTemplate.versionSidebar.lastUpdated")}
            <br />
            {format(updatedAt, "MMM dd, yyyy")}
          </Text>
        ) : (
          <VersionTag versionDate={versionDate} />
        )}
      </HStack>
      {renderTemplateButton()}
    </Flex>
  )
})
