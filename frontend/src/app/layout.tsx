import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import clsx from 'clsx'

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: "--font-jakarta" })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: "--font-space" })

export const metadata: Metadata = {
  title: 'Etharis - Trustless Sponsorship Escrow',
  description: 'Secure sponsorship deals with blockchain escrow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='hide-scrollbar'>
      <body className={clsx(plusJakartaSans.variable, spaceGrotesk.variable, "font-space")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
