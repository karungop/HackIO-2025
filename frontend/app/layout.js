import './globals.css'

export const metadata = {
  title: 'Frontend App',
  description: 'Next.js frontend application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}