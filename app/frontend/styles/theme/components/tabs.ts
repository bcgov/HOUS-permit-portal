export const Tabs = {
  variants: {
    sidebar: {
      tab: {
        justifyContent: "flex-start",
        textDecoration: "none",
        _hover: {
          bg: "greys.grey02",
          textDecoration: "none",
        },
        _selected: {
          fontWeight: "bold",
          bg: "background.blueLight",
          _hover: {
            bg: "hover.blue",
            textDecoration: "none",
          },
        },
        _focus: {
          boxShadow: "none",
          outline: "none",
        },
        _focusVisible: {
          boxShadow: "none",
          outline: "none",
        },
      },
    },
  },
}
