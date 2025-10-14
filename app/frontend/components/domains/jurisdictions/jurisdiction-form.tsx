import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  InputGroup,
  Switch,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { EJurisdictionTypes } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { AsyncRadioGroup } from "../../shared/base/inputs/async-radio-group"
import { TextFormControl } from "../../shared/form/input-form-control"
import { JurisdictionSelect } from "../../shared/select/selectors/jurisdiction-select"
import { SitesSelect, TSitesSelectProps } from "../../shared/select/selectors/sites-select"

export type TJurisdictionFormValues = {
  name: string
  localityType: string
  regionalDistrict: IJurisdiction
  ltsaMatcher: string
  site: IOption
  pid: string
}

type TJurisdictionFormProps = {
  useCustom: boolean
  onToggleCustom: () => void
  onLtsaMatcherFound: (matcher: string | null) => void
  sitesSelectProps?: Partial<TSitesSelectProps>
}

export const JurisdictionFormSection: React.FC<TJurisdictionFormProps> = ({
  useCustom,
  onToggleCustom,
  onLtsaMatcherFound,
  sitesSelectProps = {},
}) => {
  const { t } = useTranslation()
  const {
    jurisdictionStore: { fetchLocalityTypeOptions, regionalDistrictLocalityType },
  } = useMst()
  const { control, watch, setValue } = useFormContext<TJurisdictionFormValues>()
  const localityTypeWatch = watch("localityType")

  return (
    <Flex direction="column" as="section" gap={6} w="full" p={6} border="solid 1px" borderColor="border.light">
      <Flex gap={8}>
        <Flex w="50%">
          <Text mr={4} mt={10}>
            The
          </Text>
          {useCustom ? (
            <TextFormControl label={t("jurisdiction.fields.localityType")} fieldName={"localityType"} required />
          ) : (
            <AsyncRadioGroup
              label={t("jurisdiction.fields.localityType")}
              fetchOptions={fetchLocalityTypeOptions}
              fieldName={"localityType"}
            />
          )}

          <Text ml={8} mt={10}>
            of
          </Text>
        </Flex>
        <Box w="50%">
          <TextFormControl label={t("jurisdiction.new.nameLabel")} fieldName={"name"} required />
        </Box>
      </Flex>

      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="use-custom" mb="0">
          {t("jurisdiction.new.useCustom")}
        </FormLabel>
        <Switch id="use-custom" isChecked={useCustom} onChange={onToggleCustom} />
      </FormControl>

      <Flex gap={8}>
        <Box w="full">
          <Controller
            name="regionalDistrict"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl w="full" zIndex={1}>
                <FormLabel>{`${t("jurisdiction.fields.regionalDistrictName")} ${t("ui.optional")}`}</FormLabel>
                <InputGroup w="full">
                  <JurisdictionSelect
                    onChange={onChange}
                    isDisabled={localityTypeWatch == regionalDistrictLocalityType}
                    filters={{ type: EJurisdictionTypes.regionalDistrict }}
                    selectedOption={{
                      label: value?.reverseQualifiedName,
                      value,
                    }}
                    menuPortalTarget={document.body}
                  />
                </InputGroup>
              </FormControl>
            )}
          />
        </Box>
      </Flex>

      <Flex gap={8}>
        <Box w="full">
          <FormControl>
            <FormLabel display="flex" alignItems="center" gap={2}>
              {t("jurisdiction.determineWithSite")}
              <Tooltip label={t("jurisdiction.ltsaMatcherExplanation")} hasArrow>
                <IconButton
                  aria-label={t("jurisdiction.ltsaMatcherExplanation")}
                  icon={<Info size={16} />}
                  size="xs"
                  variant="ghost"
                  type="button"
                />
              </Tooltip>
            </FormLabel>
            <Controller
              name="site"
              control={control}
              render={({ field: { onChange, value } }) => (
                <SitesSelect
                  onChange={onChange}
                  selectedOption={value}
                  pidName="pid"
                  siteName="site"
                  onLtsaMatcherFound={onLtsaMatcherFound}
                  showJurisdiction={false}
                  jurisdictionIdFieldName="matchedJurisdictionId"
                  {...sitesSelectProps}
                />
              )}
            />
          </FormControl>
        </Box>
      </Flex>

      <Flex gap={4} align="flex-end">
        <Box flex="1">
          <TextFormControl
            label={t("jurisdiction.fields.ltsaMatcher")}
            fieldName={"ltsaMatcher"}
            inputProps={{
              isDisabled: true,
            }}
            LabelInfo={() => (
              <Tooltip label={t("jurisdiction.ltsaMatcherHelp")} hasArrow>
                <IconButton
                  mb={2}
                  ml={2}
                  aria-label={t("jurisdiction.ltsaMatcherHelp")}
                  icon={<Info size={16} />}
                  size="xs"
                  variant="ghost"
                  type="button"
                />
              </Tooltip>
            )}
          />
        </Box>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setValue("ltsaMatcher", "")
          }}
        >
          {t("ui.clear")}
        </Button>
      </Flex>
    </Flex>
  )
}
