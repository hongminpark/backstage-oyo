import { extendTheme } from "@chakra-ui/react";

const theme = {
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

export default extendTheme({ theme });
