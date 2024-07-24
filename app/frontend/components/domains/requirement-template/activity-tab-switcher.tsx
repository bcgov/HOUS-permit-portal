import { Tab, TabList, TabPanelProps, TabPanels, TabProps, Tabs, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { IActivity } from "../../../models/permit-classification"
import { IOption } from "../../../types/types"

interface IActivityTabSwitcherProps {
  selectedTabIndex: number
  navigateToActivityTab: (activityId: string, replace?: boolean) => void
  enabledActivityOptions: IOption<IActivity>[]
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
export const ActivityTabSwitcher: React.FC<IActivityTabSwitcherProps> = ({
  selectedTabIndex,
  navigateToActivityTab,
  enabledActivityOptions,
  children,
}) => {
  return (
    <Tabs orientation="vertical" as="article" index={selectedTabIndex} isLazy>
      <TabList borderLeft="none" w="200px">
        <Text as="h2" {...sharedTabTextStyles} fontWeight={700}>
          {"Work Type"}
        </Text>
        {enabledActivityOptions.map((activityOption) => (
          <Tab
            key={activityOption.value.id}
            onClick={() => navigateToActivityTab(activityOption.value.id)}
            {...tabStyles}
          >
            {activityOption.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels flex={1}>{children}</TabPanels>
    </Tabs>
  )
}
