import { Box, FormControl, FormLabel, InputGroup, useBreakpointValue, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { JurisdictionSelect } from "../select/selectors/jurisdiction-select"
import { StepCodeLookupAddressSelect } from "../select/selectors/step-code-lookup-address-select"

interface IStepCodeAddressSearchForm {
  address: IOption
}

interface IStepCodeAddressSearchProps {
  onJurisdictionFound?: (jurisdiction: IJurisdiction | null, address?: string) => void
  setShowError: (show: boolean) => void
  showError: boolean
}

const StepCodeAddressSearch = observer(
  ({ onJurisdictionFound, setShowError, showError }: IStepCodeAddressSearchProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [selectedSite, setSelectedSite] = useState<number | null>(null)
    const [selectedOption, setSelectedOption] = useState<IOption | null>(null)
    const [searchKey, setSearchKey] = useState(0)
    const [manualJurisdiction, setManualJurisdiction] = useState<IJurisdiction | null>(null)
    const isMobile = useBreakpointValue({ base: true, md: false })
    const isHomePage = location.pathname === "/welcome" ? true : false
    const { geocoderStore, jurisdictionStore } = useMst()
    const { addJurisdiction } = jurisdictionStore

    const methods = useForm<IStepCodeAddressSearchForm>({
      defaultValues: {
        address: null,
      },
    })
    const { control } = methods

    const handleCheckAddress = async () => {
      if (!selectedSite) {
        onJurisdictionFound?.(null)
        setShowError(true)
        setSelectedSite(null)
        //onJurisdictionFound?.(null)
        return
      }

      const result = await geocoderStore.fetchGeocodedJurisdiction(String(selectedSite))
      const jurisdiction = result?.jurisdiction
      const addressLabel = selectedOption?.label || ""

      if (!jurisdiction) {
        onJurisdictionFound?.(null)
        setShowError(true)
        setSelectedSite(null)
        return
      }

      if (isHomePage) {
        onJurisdictionFound?.(jurisdiction, addressLabel)
        setSearchKey((k) => k + 1)
        setSelectedSite(null)
        setSelectedOption(null)
      } else if (onJurisdictionFound) {
        // If parent provided a callback (like in StepCodeLookupTool), call it
        onJurisdictionFound(jurisdiction, addressLabel)
        // We don't clear state or navigate here if we're using the lookup tool inline
      } else {
        navigate(
          `/jurisdictions/${jurisdiction.slug}/step-code-requirements?address=${encodeURIComponent(addressLabel)}`
        )
      }
    }

    return (
      <FormProvider {...methods}>
        <VStack w="full" spacing={0}>
          <Controller
            key={searchKey}
            name="address"
            control={control}
            render={({ field }) => (
              <StepCodeLookupAddressSelect
                value={field.value}
                onChange={(option) => {
                  field.onChange(option)
                  setSelectedSite(option?.value as number)
                  setSelectedOption(option)
                }}
                onButtonClick={handleCheckAddress}
                isButtonDisabled={!selectedSite}
                buttonText={t(
                  "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.checkAddress"
                )}
                showError={showError}
                setShowError={setShowError}
              />
            )}
          />
          <Box aria-live="polite" w={"full"}>
            {showError && (
              <FormControl w="full" zIndex={1} mt={4}>
                <FormLabel fontWeight="bold">{t("ui.cityOrJurisdiction")}</FormLabel>
                <InputGroup w={isMobile ? "100%" : "57%"}>
                  <JurisdictionSelect
                    onChange={(value) => {
                      if (value) addJurisdiction(value)
                      setManualJurisdiction(value)
                      const addressLabel = selectedOption?.label || ""
                      onJurisdictionFound?.(value, addressLabel)
                      setShowError(false) // hide the error and dropdown once selected
                    }}
                    selectedOption={{ label: manualJurisdiction?.reverseQualifiedName, value: manualJurisdiction }}
                    menuPortalTarget={document.body}
                  />
                </InputGroup>
              </FormControl>
            )}
          </Box>
        </VStack>
      </FormProvider>
    )
  }
)

export default StepCodeAddressSearch
