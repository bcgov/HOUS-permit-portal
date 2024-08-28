import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../setup/root"

export const useCurrentUserLicenseAgreements = ({ customErrorMessage }: { customErrorMessage?: string } = {}) => {
  const { userStore } = useMst()
  const currentUser = userStore.currentUser
  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const fetchEulaPromise = userStore.fetchEULA()
        const fetchLicenseAgreementsPromise = currentUser.fetchAcceptedEulas()

        const [fetchEulaSuccess, fetchLicenseAgreementsSuccess] = await Promise.all([
          fetchEulaPromise,
          fetchLicenseAgreementsPromise,
        ])

        if (!fetchEulaSuccess || !fetchLicenseAgreementsSuccess) {
          setError(new Error(customErrorMessage ?? t("errors.fetchCurrentUserLicenseAgreements")))
        }
      } catch (_e) {
        setError(new Error(customErrorMessage ?? t("errors.fetchCurrentUserLicenseAgreements")))
      } finally {
        setIsLoading(false)
      }
    })()
  }, [currentUser?.id])

  return { currentEula: userStore.eula, licenseAgreements: currentUser.licenseAgreements, isLoading, error }
}
