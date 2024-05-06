import { extendTheme } from "@chakra-ui/react";

const theme = {
    components: {
        Progress: {
            baseStyle: {},
            sizes: {},
            variants: {},
            defaultProps: {},
        },
    },
    colors: {
        black: {
            50: "#e0e0e0",
            100: "#b3b3b3",
            200: "#808080",
            300: "#4d4d4d",
            400: "#262626",
            500: "#000000",
            600: "#0d0d0d",
            700: "#0a0a0a",
            800: "#050505",
            900: "#000000",
        },
    },
    styles: {
        global: {
            body: {
                margin: 0,
                fontSize: "12px",
                "font-family":
                    "Helvetica Neue, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen','Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',sans-serif",
                "-webkit-font-smoothing": "antialiased",
                "-moz-osx-font-smoothing": "grayscale",
            },
        },
    },
};

export default extendTheme(theme);
