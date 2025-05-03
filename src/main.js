import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './style.css' // Optional global styles

// Import locale messages
import enMessages from './locales/en.json'
import hiMessages from './locales/hi.json'

// Determine initial locale (check localStorage or browser default)
let initialLocale = 'en'; // Default
try {
    const savedLang = localStorage.getItem('calculatorPreferredLanguage');
    if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
        initialLocale = savedLang;
    } else {
         const browserLang = navigator.language.split('-')[0]; // Get 'en' from 'en-US'
         if (browserLang === 'hi') {
             initialLocale = 'hi';
         }
    }
} catch (e) {
    console.warn("Could not access localStorage to get preferred language.");
}


// Setup i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: initialLocale, // Default locale
  fallbackLocale: 'en', // Fallback locale
  messages: {
    en: enMessages,
    hi: hiMessages,
  },
})

const app = createApp(App)

app.use(i18n) // Use i18n plugin
app.mount('#app')