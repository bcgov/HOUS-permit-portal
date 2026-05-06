import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  Flex,
  FlexProps,
  HStack,
  Menu,
  Portal,
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
  open?: boolean
  onClose?: () => void
}

export const TemplateVersionsSidebar = observer(function TemplateVersionsSidebar({
  requirementTemplate,
  isOpen: externalIsOpen,
  open: externalOpen,
  onClose: externalOnClose,
}: IProps) {
  const { open: internalIsOpen, onOpen: internalOnOpen, onClose: internalOnClose } = useDisclosure()
  const btnRef = React.useRef()

  const isOpen = externalOpen ?? externalIsOpen ?? internalIsOpen
  const onClose = externalOnClose || internalOnClose
  const onOpen = internalOnOpen

  return (
    <>
      {externalIsOpen === undefined && (
        <Button size="sm" variant={"primary"} onClick={onOpen}>
          {t("requirementTemplate.versionSidebar.triggerButton")}
        </Button>
      )}
      <Drawer.Root
        open={isOpen}
        placement="end"
        finalFocusEl={() => btnRef.current}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content maxW="644px" pt="var(--app-navbar-height)">
              <Drawer.CloseTrigger />
              <Drawer.Header mt={4} px={8} borderBottom="1px solid" borderColor={"border.light"}>
                <Text as="h2" fontWeight={700} fontSize={"2xl"}>
                  {t("requirementTemplate.versionSidebar.title")}
                </Text>
                <Text
                  fontSize={"md"}
                  fontWeight={700}
                  mt={2}
                >{`${t("requirementTemplate.versionSidebar.subtitlePrefix")} ${requirementTemplate.displayLabel}`}</Text>
              </Drawer.Header>
              <Drawer.Body py={10} px={8}>
                <Stack gap={10}>
                  <Box w="full">
                    <VersionsList
                      type={ETemplateVersionStatus.published}
                      templateVersions={
                        requirementTemplate.publishedTemplateVersion
                          ? [requirementTemplate.publishedTemplateVersion]
                          : []
                      }
                    />
                  </Box>
                  {!requirementTemplate.isDiscarded && (
                    <Box>
                      <Text as="h3" fontSize={"xl"} fontWeight={700} mb={2}>
                        {t("requirementTemplate.versionSidebar.listTitles.templateBuilder")}
                      </Text>

                      <VersionCard
                        viewRoute={`/requirement-templates/${requirementTemplate.id}/edit`}
                        status={"builder"}
                        updatedAt={requirementTemplate.updatedAt}
                      />
                    </Box>
                  )}
                  {requirementTemplate.draftTemplateVersion && (
                    <Box>
                      <Text as="h3" fontSize={"xl"} fontWeight={700} mb={2}>
                        {t("requirementTemplate.versionSidebar.listTitles.draft")}
                      </Text>

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
                    </Box>
                  )}

                  <VersionsList
                    type={ETemplateVersionStatus.scheduled}
                    templateVersions={requirementTemplate.scheduledTemplateVersions}
                    onUnschedule={requirementTemplate.unscheduleTemplateVersion}
                  />

                  <VersionsList
                    type={ETemplateVersionStatus.deprecated}
                    templateVersions={requirementTemplate.lastThreeDeprecatedTemplateVersions}
                  />
                  {requirementTemplate.publishedTemplateVersion && (
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <Button aria-label="Options" variant="secondary" px={2}>
                          {t("ui.export")}
                          <Export />
                        </Button>
                      </Menu.Trigger>

                      <Portal>
                        <Menu.Positioner>
                          <Menu.Content>
                            <Menu.Item
                              onSelect={requirementTemplate.publishedTemplateVersion.downloadRequirementSummary}
                              value="item-0"
                            >
                              <HStack gap={2} fontSize={"sm"}>
                                <FileCsv size={24} />
                                <Text as={"span"}>{t("requirementTemplate.export.downloadSummaryCsv")}</Text>
                              </HStack>
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Positioner>
                      </Portal>
                    </Menu.Root>
                  )}
                </Stack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  )
})

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
          onUnschedule={() => onUnschedule(templateVersion.id)}
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
        status: "builder" | ETemplateVersionStatus.draft
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
        <Button variant={"primary"} size="sm" asChild>
          <RouterLink to={viewRoute}>{t("requirementTemplate.versionSidebar.viewTemplateButton")}</RouterLink>
        </Button>
      )
    } else if (status === "builder") {
      return (
        <Button variant={"primary"} size="sm" asChild>
          <RouterLink to={viewRoute}>
            <Pencil />
            {t("translation:requirementTemplate.versionSidebar.openBuilderButton")}
          </RouterLink>
        </Button>
      )
    } else if (status === ETemplateVersionStatus.draft) {
      return (
        <Button variant={"primary"} size="sm" asChild>
          <RouterLink to={viewRoute}>{t("requirementTemplate.versionSidebar.viewDraftButton")}</RouterLink>
        </Button>
      )
    } else {
      return (
        <ButtonGroup gap={4}>
          <Button variant={"primary"} size="sm" asChild>
            <RouterLink to={viewRoute}>{t("ui.preview")}</RouterLink>
          </Button>
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
        </ButtonGroup>
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
      {...containerProps}
    >
      <HStack gap={16}>
        <TemplateStatusTag
          status={status}
          scheduledFor={status === ETemplateVersionStatus.scheduled && versionDate ? versionDate : undefined}
          subText={status === ETemplateVersionStatus.deprecated ? deprecationReasonLabel : undefined}
        />
        {status === "builder" || status === ETemplateVersionStatus.draft ? (
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
