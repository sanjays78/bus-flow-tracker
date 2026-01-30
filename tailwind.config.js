/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx"
    ],
    theme: {
        extend: {
            colors: {
                mmt: {
                    blue: '#008cff',
                    dark: '#0a223d',
                    bg: '#f2f2f2',
                    text: '#4a4a4a',
                    hover: '#0075d9'
                }
            },
            borderRadius: {
                'mmt': '8px'
            }
        },
    },
    plugins: [],
}
