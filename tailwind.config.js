/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/js/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#60a5fa",
                "background-dark": "#09090b",
                "surface-dark": "#18181b",
                "text-main-dark": "#e4e4e7",
                "text-muted-dark": "#a1a1aa",
                "border-dark": "#27272a",
                "card-new": "#60a5fa",
                "card-learning": "#f87171",
                "card-due": "#4ade80",
                "accent-green": "#13ec5b",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.75rem",
            },
        },
    },
    plugins: [],
}
