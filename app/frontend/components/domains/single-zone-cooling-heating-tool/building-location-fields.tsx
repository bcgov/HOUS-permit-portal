import { Box, Grid, GridProps, Heading, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { TextFormControl } from "../../shared/form/input-form-control"

export interface BuildingLocationFieldsProps {
  namePrefix?: string
  i18nPrefix: string
  gridProps?: Partial<GridProps>
}

export const BuildingLocationFields: React.FC<BuildingLocationFieldsProps> = ({
  namePrefix = "buildingLocation",
  i18nPrefix,
  gridProps,
}) => {
  const { t } = useTranslation()
  const prefix = "singleZoneCoolingHeatingTool"

  const field = (key: string) => `${namePrefix}.${key}`
  const label = (key: string) => t(`${i18nPrefix}.${key}` as any)

  return (
    <Box>
      <Box display="flex" gap={10} mb={6}>
        <Box width="80%">
          <TextFormControl fieldName="drawingIssueFor" required label={t(`${prefix}.drawingIssueFor`)} />
          <Text as="p" mb={2}>
            {t(`${prefix}.drawingIssueForHelpText`)}
          </Text>
        </Box>
        <Box width="20%">
          <TextFormControl fieldName="projectNumber" required label={t(`${prefix}.projectNumber`)} />
        </Box>
      </Box>
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h2" size="lg" mb={6} textAlign="center" textTransform="uppercase">
          {t(`${i18nPrefix}.title` as any)}
        </Heading>
      </Box>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} {...gridProps}>
        <TextFormControl fieldName={field("model")} required label={label("model")} maxLength={50} />
        <TextFormControl fieldName={field("site")} required label={label("site")} maxLength={60} />
        <TextFormControl fieldName={field("lot")} required label={label("lot")} maxLength={60} />
        <TextFormControl fieldName={field("address")} required label={label("address")} />
        <TextFormControl fieldName={field("city")} required label={label("city")} maxLength={60} />
        <TextFormControl fieldName={field("province")} required label={label("province")} maxLength={60} />
        <TextFormControl fieldName={field("postalCode")} required label={label("postalCode")} maxLength={60} />
      </Grid>
    </Box>
  )
}
