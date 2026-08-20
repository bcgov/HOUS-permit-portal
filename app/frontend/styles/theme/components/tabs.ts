export const Tabs = {
  variants: {
    sidebar: {
      tab: {
        justifyContent: "flex-start",
        textDecoration: "none",
        color: "text.primary",
        // Tabs are RouterLinks for copy/open-in-new-tab. :visited ignores
        // `inherit` in most browsers — use an explicit color.
        _visited: {
          color: "text.primary",
        },
        _active: {
          color: "text.primary",
        },
        _hover: {
          bg: "greys.grey02",
          textDecoration: "none",
          color: "text.primary",
        },
        _selected: {
          fontWeight: "bold",
          bg: "background.blueLight",
          color: "text.primary",
          _visited: {
            color: "text.primary",
          },
          _hover: {
            bg: "hover.blue",
            textDecoration: "none",
            color: "text.primary",
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
