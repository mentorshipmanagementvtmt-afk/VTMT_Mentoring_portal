import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ConfigProvider } from 'antd'
const qc = new QueryClient()

const theme = {
  token: {
    colorPrimary: '#4b41e1',
    colorInfo: '#4b41e1',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ba1a1a',
    colorTextBase: '#1b1b1d',
    colorBgBase: '#fbf8fa',
    colorBorder: '#c5c6cd',
    borderRadius: 12,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  components: {
    Layout: {
      headerBg: '#ffffff'
    },
    Button: {
      controlHeight: 42,
      fontWeight: 600
    },
    Card: {
      borderRadiusLG: 16
    },
    Input: {
      controlHeight: 42
    },
    Select: {
      controlHeight: 42
    },
    Menu: {
      itemHeight: 46,
      itemBorderRadius: 14,
      itemActiveBg: '#eef2ff',
      itemSelectedBg: '#f5f3ff',
      itemSelectedColor: '#4b41e1',
      itemColor: '#5b6474'
    },
    Tabs: {
      itemActiveColor: '#4b41e1',
      itemSelectedColor: '#4b41e1',
      inkBarColor: '#4b41e1'
    },
    Table: {
      headerBg: '#f5f3f4',
      headerColor: '#45474c'
    },
    Tag: {
      borderRadiusSM: 999
    }
  }
}

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={qc}>
      <ConfigProvider theme={theme}>
        <Toaster position="top-center" />
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  )
}
