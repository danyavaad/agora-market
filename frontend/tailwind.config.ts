import type { Config } from 'tailwindcss'

export default <Config>{
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
        './error.vue'
    ],
    theme: {
        extend: {
            colors: {
                'basil-green': {
                    DEFAULT: '#7CAD58',
                    dark: '#4B7332',
                    light: '#C5E8AF' // Much brighter for text on dark bg
                },
                'moss-green': {
                    DEFAULT: '#2D4B24',
                    dark: '#1D3017',
                    light: '#4B7332'
                },
                'forest-dark': {
                    DEFAULT: '#0A120B', // Even deeper black-green
                    card: '#121F13'
                },
                'earth-brown': {
                    DEFAULT: '#362B24',
                    light: '#544439',
                    cream: '#FDFCF7' // New color for high contrast text
                },
                'pumpkin-orange': {
                    DEFAULT: '#E68A3E', // More vivid
                    hover: '#C2702E'
                },
                'tomato-red': '#FA5252',
                'paper-beige': '#FDFCF7',
                'pizarra': '#141414'
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem'
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Merriweather', 'serif'] // Adding a serif for that artisanal feel
            }
        }
    },
    plugins: []
}
