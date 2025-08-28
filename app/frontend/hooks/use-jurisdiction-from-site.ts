import * as R from "ramda"
import { useEffect, useState } from "react"
import { IJurisdiction } from "../models/jurisdiction"
import { useMst } from "../setup/root"

interface IUseJurisdictionFromSiteOptions {
  siteFieldName?: string
  jurisdictionIdFieldName?: string
  disabled?: boolean
}

// Watches a RHF "site" field and populates the RHF "jurisdictionId" field using geocoder
export function useJurisdictionFromSite(
  watch: (name: string) => any,
  setValue: (name: string, value: any) => void,
  options: IUseJurisdictionFromSiteOptions = {}
) {
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction | null>(null)
  const siteFieldName = options.siteFieldName ?? "site"
  const jurisdictionIdFieldName = options.jurisdictionIdFieldName ?? "jurisdictionId"
  const { geocoderStore, jurisdictionStore } = useMst()
  const { fetchGeocodedJurisdiction } = geocoderStore
  const { addJurisdiction } = jurisdictionStore

  const siteWatch = watch(siteFieldName)
  const isDisabled = options.disabled === true

  useEffect(() => {
    if (isDisabled) {
      return
    }
    const siteValue: string | undefined = siteWatch?.value
    if (R.isNil(siteValue) || siteValue === "") {
      // Do not overwrite an existing default jurisdictionId when no site is selected
      setJurisdiction(null)
      return
    }

    let isActive = true
    ;(async () => {
      try {
        const jurisdiction = await fetchGeocodedJurisdiction(siteValue, undefined)
        if (!isActive) return
        if (jurisdiction) {
          addJurisdiction(jurisdiction)
          setValue(jurisdictionIdFieldName, jurisdiction.id)
          setJurisdiction(jurisdiction)
        } else {
          setValue(jurisdictionIdFieldName, null)
          setJurisdiction(null)
        }
      } catch (_e) {
        setValue(jurisdictionIdFieldName, null)
        setJurisdiction(null)
      }
    })()

    return () => {
      isActive = false
    }
  }, [siteWatch?.value, isDisabled])

  return jurisdiction
}
