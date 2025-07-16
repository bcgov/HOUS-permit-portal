import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { StepCodeLookupAddressSelect } from "../select/selectors/step-code-lookup-address-select"

interface IStepCodeAddressSearchForm {
  address: IOption
}

interface IStepCodeAddressSearchProps {
  onJurisdictionFound?: (jurisdiction: IJurisdiction) => void
}

const StepCodeAddressSearch = observer(({ onJurisdictionFound }: IStepCodeAddressSearchProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedSite, setSelectedSite] = useState<number | null>(null)
  const [searchKey, setSearchKey] = useState(0)
  const { geocoderStore } = useMst()
  const methods = useForm<IStepCodeAddressSearchForm>({
    defaultValues: {
      address: null,
    },
  })
  const { control } = methods

  const handleCheckAddress = async () => {
    if (selectedSite) {
      const jurisdiction = await geocoderStore.fetchGeocodedJurisdiction(String(selectedSite))
      if (jurisdiction) {
        if (onJurisdictionFound) {
          onJurisdictionFound(jurisdiction)
          setSearchKey((k) => k + 1)
          setSelectedSite(null)
        } else {
          navigate(`/jurisdictions/${jurisdiction.slug}/step-code-requirements`)
        }
      }
    } else {
      onJurisdictionFound(null)
    }
  }

  return (
    <FormProvider {...methods}>
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
            }}
            onButtonClick={handleCheckAddress}
            isButtonDisabled={!selectedSite}
            buttonText={t("home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.checkAddress")}
          />
        )}
      />
    </FormProvider>
  )
})

export default StepCodeAddressSearch
