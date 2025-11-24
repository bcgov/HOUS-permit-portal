export const Tabs = {
  variants: {
    sidebar: {
      tab: {
        justifyContent: "flex-start",
        _selected: {
          fontWeight: "bold",
          bg: "background.blueLight",
          _hover: {
            bg: "hover.blue",
          },
        },
        _hover: {
          bg: "greys.grey02",
        },
      },
    },
  },
}
