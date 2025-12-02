import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Google Font - Body text
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Local Fonts - Brand fonts
const calSans = localFont({
  src: "../../public/Cal_Sans/CalSans-Regular.ttf",
  variable: "--font-cal-sans",
  display: "swap",
});

const mayonice = localFont({
  src: "../../public/mayonice/Mayonice.otf",
  variable: "--font-mayonice",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portable Spas NZ - Infographic Generator",
  description: "AI-powered infographic generator for Portable Spas New Zealand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${calSans.variable} ${mayonice.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
