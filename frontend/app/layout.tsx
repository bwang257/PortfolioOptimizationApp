import type { Metadata } from 'next'
import './globals.css'
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext'

export const metadata: Metadata = {
  title: 'Portfolio Optimizer',
  description: 'Optimize your investment portfolio using modern portfolio theory',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 antialiased">
        <UserPreferencesProvider>
          {children}
        </UserPreferencesProvider>
      </body>
    </html>
  )
}
