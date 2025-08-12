import { Grid, GridItem, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { DotsThreeVertical } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IStepCode } from "../../../stores/step-code-store"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { FileDownloadButton } from "../../shared/base/file-download-button"

export const StepCodesGridRow = observer(({ stepCode }: { stepCode: IStepCode }) => {
  const navigate = useNavigate()
  const permitApplicationId = (stepCode as any)?.permitApplication?.id
  const { t } = useTranslation()
  const { type, projectName, fullAddress, updatedAt } = stepCode
  // Navigate to standalone Part 3 route when applicable, otherwise fallback to the permit-application edit routes
  const targetPath =
    type === "Part3StepCode"
      ? `/part-3-step-code/${stepCode.id}/start`
      : permitApplicationId
        ? `/permit-applications/${permitApplicationId}/edit/part-9-step-code`
        : undefined

  return (
    <Grid
      gridColumn="1 / -1"
      templateColumns="subgrid"
      display="grid"
      onClick={() => targetPath && navigate(targetPath)}
      _hover={{ bg: "greys.grey03", cursor: targetPath ? "pointer" : "default" }}
      borderBottom="1px"
      borderColor="border.light"
      _last={{ borderBottom: "none" }}
    >
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{t(`stepCode.types.${type}`)}</Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{projectName}</Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{fullAddress}</Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{updatedAt ? format(updatedAt, datefnsTableDateTimeFormat) : ""}</Text>
      </GridItem>
      <GridItem
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        px={2}
        py={2}
        onClick={(e) => e.stopPropagation()}
      >
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label={t("ui.options")}
            icon={<DotsThreeVertical size={20} />}
            variant="ghost"
          />
          <MenuList>
            {(stepCode as any)?.reportDocuments?.length > 0 && (
              <MenuItem onClick={(e) => e.stopPropagation()}>
                <FileDownloadButton
                  modelType={EFileUploadAttachmentType.ReportDocument}
                  document={(stepCode as any).reportDocuments[0]}
                  variant="ghost"
                  size="sm"
                />
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </GridItem>
    </Grid>
  )
})
