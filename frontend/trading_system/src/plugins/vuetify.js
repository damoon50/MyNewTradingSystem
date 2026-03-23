import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import '@mdi/font/css/materialdesignicons.css'
import tradingTerminalTheme from '../styles/theme'

Vue.use(Vuetify);

const { palette } = tradingTerminalTheme;

export default new Vuetify({
    icons: {
        iconfont: 'mdi'
    },
    theme: {
        dark: false,
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: palette.primary,
                secondary: palette.text,
                accent: palette.mutedText,
                error: palette.danger,
                info: palette.info,
                success: palette.success,
                warning: palette.warning,
                background: palette.background,
                surface: palette.surface,
            },
        },
    },
});
