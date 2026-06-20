import "./globals.css"

export const metadata = {
  title: "Hail Depot",
  description: "Find trusted tradespeople in Accra and Kasoa",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}