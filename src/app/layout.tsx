import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import { ThemeSwitcher } from '../components/ThemeSwitcher'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Krismini',
  description: 'Your Next.js application with Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + ' bg-[#f5f0fa] dark:bg-[#18181b] text-gray-900 dark:text-gray-100 transition-colors min-h-screen'}>
        {/* <ThemeSwitcher /> */}
        {children}
      </body>
    </html>
  )
} 