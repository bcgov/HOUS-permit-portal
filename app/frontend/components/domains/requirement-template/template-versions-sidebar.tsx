import {
  Box,
  Button,
  ButtonGroup,
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
import { RouterLink } from "../../shared/navigation/router-link"
import { TemplateStatusTag } from "../../shared/requirement-template/template-status-tag"
import { VersionTag } from "../../shared/version-tag"

interface IProps {
  requirementTemplate: IRequirementTemplate
}

export const TemplateVersionsSidebar = observer(function TemplateVersionsSidebar({ requirementTemplate }: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  return (
    <>
      <Button size="sm" variant={"primary"} onClick={onOpen}>
        {t("requirementTemplate.versionSidebar.triggerButton")}
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent maxW="644px">
          <DrawerCloseButton />
          <DrawerHeader mt={4} px={8} borderBottom="1px solid" borderColor={"border.light"}>
            <Text as="h2" fontWeight={700} fontSize={"2xl"}>
              {t("requirementTemplate.versionSidebar.title")}
            </Text>
            <Text
              fontSize={"md"}
              fontWeight={700}
              mt={2}
            >{`${t("requirementTemplate.versionSidebar.subtitlePrefix")} ${requirementTemplate.permitType.name} | ${requirementTemplate.activity.name}`}</Text>
          </DrawerHeader>

          <DrawerBody py={10} px={8}>
            <Stack spacing={10}>
              <Box w="full">
                <VersionsList
                  type={ETemplateVersionStatus.published}
                  templateVersions={
                    requirementTemplate.publishedTemplateVersion ? [requirementTemplate.publishedTemplateVersion] : []
                  }
                />
              </Box>
              {!requirementTemplate.isDiscarded && (
                <Box>
                  <Text as="h3" fontSize={"xl"} fontWeight={700} mb={2}>
                    {t("requirementTemplate.versionSidebar.listTitles.draft")}
                  </Text>

                  <VersionCard
                    viewRoute={`/requirement-templates/${requirementTemplate.id}/edit`}
                    status={ETemplateVersionStatus.draft}
                    updatedAt={requirementTemplate.updatedAt}
                  />
                </Box>
              )}

              <VersionsList
                type={ETemplateVersionStatus.scheduled}
                templateVersions={requirementTemplate.scheduledTemplateVersions}
                onUnschedule={requirementTemplate.unscheduleTemplateVersion}
              />

              <VersionsList
                type={ETemplateVersionStatus.deprecated}
                templateVersions={requirementTemplate.deprecatedTemplateVersions}
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
        />
      ))}
    </Box>
  )
})

type TVersionCardProps = Partial<FlexProps> & { viewRoute: string; onUnschedule?: () => Promise<boolean> } & (
    | { status: Exclude<ETemplateVersionStatus, ETemplateVersionStatus.draft>; versionDate: Date; updatedAt?: never }
    | { status: ETemplateVersionStatus.draft; versionDate?: never; updatedAt: Date }
  )

const VersionCard = observer(function VersionCard({
  viewRoute,
  onUnschedule,
  status,
  versionDate,
  updatedAt,
  ...containerProps
}: TVersionCardProps) {
  const { t } = useTranslation()
  const [isPending, setIsPending] = React.useState(false)

  const renderTemplateButton = () => {
    if (status === ETemplateVersionStatus.published || status === ETemplateVersionStatus.deprecated) {
      return (
        <Button as={RouterLink} to={viewRoute} variant={"primary"} size="sm">
          {t("requirementTemplate.versionSidebar.viewTemplateButton")}
        </Button>
      )
    } else if (status === ETemplateVersionStatus.draft) {
      return (
        <Button as={RouterLink} to={viewRoute} variant={"primary"} size="sm" leftIcon={<Pencil />}>
          {t("translation:requirementTemplate.versionSidebar.resumeDraftButton")}
        </Button>
      )
    } else {
      return (
        <ButtonGroup spacing={4}>
          <Button as={RouterLink} to={viewRoute} variant={"primary"} size="sm">
            {t("ui.preview")}
          </Button>
          <Button
            variant={"secondary"}
            size="sm"
            onClick={
              onUnschedule
                ? async () => {
                    try {
                      setIsPending(true)
                      const isSuccess = await onUnschedule()

                      // only update the state if the unschedule was unsuccessful.
                      // this is because on successfull unschedule, this component would be
                      // unmounted and removed
                      !isSuccess && setIsPending(false)
                    } catch (e) {
                      setIsPending(false)
                    }
                  }
                : undefined
            }
            isDisabled={isPending}
            isLoading={isPending}
          >
            {t("translation:requirementTemplate.versionSidebar.unscheduleButton")}
          </Button>
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
      <HStack spacing={16}>
        <TemplateStatusTag
          status={status}
          scheduledFor={status === ETemplateVersionStatus.scheduled && versionDate ? versionDate : undefined}
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
