import type { ThemeConfig } from 'antd'

/**
 * Tema de Ant Design alineado con los tokens SCSS.
 * Mantener sincronizado con shared/styles/_variables.scss.
 */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#d2662f',
    colorInfo: '#d2662f',
    colorSuccess: '#2f855a',
    colorError: '#c0392b',
    colorLink: '#b5482e',
    colorLinkHover: '#9a3d27',
    colorTextBase: '#2b2a26',
    colorBorder: '#e7e1d6',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    borderRadius: 10,
    controlHeight: 46,
    fontSize: 15,
  },
  components: {
    Button: {
      controlHeight: 48,
      fontWeight: 600,
      primaryShadow: 'none',
      borderRadius: 10,
    },
    Input: {
      controlHeight: 48,
      paddingBlock: 12,
      colorBgContainer: '#faf6ee',
      activeShadow: '0 0 0 3px rgba(210, 102, 47, 0.12)',
    },
    DatePicker: {
      controlHeight: 48,
      colorBgContainer: '#faf6ee',
    },
    Select: {
      controlHeight: 48,
      colorBgContainer: '#faf6ee',
    },
  },
}
