import { Outfit } from "next/font/google"
import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@workspace/ui/components/sonner";

const outfit = Outfit({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.className} antialiased `}
      >
        <Providers><Toaster />{children}</Providers>
      </body>
    </html>
  )
}
