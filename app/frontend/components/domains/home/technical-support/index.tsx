import { Pencil, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from ".."
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { TechnicalSupportHomeSection } from "./technical-support-home-section"

export const TechnicalSupportHomeScreen = observer(({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  const jurisdiction = currentUser.jurisdiction

  const boxes = [
    {
      title: t("home.configurationManagement.title"),
      description: t("home.configurationManagement.reviewManagerDescription"),
      icon: <Pencil size={24} />,
      href: `jurisdictions/${jurisdiction.slug}/configuration-management`,
    },
    {
      title: t("home.configurationManagement.users.title"),
      description: t("home.configurationManagement.users.description"),
      icon: <Users size={24} />,
      href: `jurisdictions/${jurisdiction.slug}/users`,
    },
  ]

  return <TechnicalSupportHomeSection heading={jurisdiction.name} boxes={boxes} />
})
