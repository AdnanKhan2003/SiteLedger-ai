import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    hover: "var(--primary-hover)",
                },
                sidebar: {
                    bg: "var(--sidebar-bg)",
                    text: "var(--sidebar-text)",
                    hover: "var(--sidebar-hover)",
                },
                border: "var(--border)",
                "input-border": "rgba(55, 53, 47, 0.16)",
            },
            fontFamily: {
                sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
