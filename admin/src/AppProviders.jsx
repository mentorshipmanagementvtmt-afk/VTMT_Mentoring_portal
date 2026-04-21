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
    Card: {
      borderRadiusLG: 16
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
