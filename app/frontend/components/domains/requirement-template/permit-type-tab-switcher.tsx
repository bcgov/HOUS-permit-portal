import { Tab, TabList, TabPanelProps, TabPanels, TabProps, Tabs, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { IPermitType } from "../../../models/permit-classification"
import { IOption } from "../../../types/types"

interface IPermitTypeTabSwitcherProps {
  selectedTabIndex: number
  navigateToPermitTypeTab: (permitTypeId: string, replace?: boolean) => void
  enabledPermitTypeOptions: IOption<IPermitType>[]
  children: ReactElement<TabPanelProps>[] | ReactElement<TabPanelProps>
}

const sharedTabTextStyles = {
  fontSize: "md",
  px: 6,
  py: 2,
  w: "full",
}

const selectedTabStyles = {
  color: "text.link",
  bg: "theme.blueLight",
  borderLeft: "4px solid",
  borderColor: "theme.blue",
  fontWeight: 700,
}

const tabStyles: TabProps = {
  ...sharedTabTextStyles,
  borderLeft: "none",
  justifyContent: "flex-start",
  _active: {
    ...selectedTabStyles,
  },
  _selected: {
    ...selectedTabStyles,
  },
}

export const PermitTypeTabSwitcher: React.FC<IPermitTypeTabSwitcherProps> = ({
  selectedTabIndex,
  navigateToPermitTypeTab,
  enabledPermitTypeOptions,
  children,
}) => {
  const { t } = useTranslation()
  return (
    <Tabs orientation="vertical" as="article" index={selectedTabIndex} isLazy>
      <TabList borderLeft="none" w="200px">
        <Text as="h2" {...sharedTabTextStyles} fontWeight={700}>
          {t("digitalBuildingPermits.index.permitType")}
        </Text>
        {enabledPermitTypeOptions.map((permitTypeOption) => (
          <Tab
            textAlign="left"
            key={permitTypeOption.value.id}
            onClick={() => navigateToPermitTypeTab(permitTypeOption.value.id)}
            {...tabStyles}
          >
            {permitTypeOption.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels flex={1}>{children}</TabPanels>
    </Tabs>
  )
}
