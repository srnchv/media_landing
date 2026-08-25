import localFont from "next/font/local";
import "./globals.css";

const evenMono = localFont({
  src: "./fonts/EvenMono-Regular.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-even-mono",
});

const pelikan = localFont({
  src: "./fonts/ABCPelikanCondensed-Medium.woff2",
  weight: "500",
  display: "swap",
  variable: "--font-pelikan",
});

export const metadata = {
  title: "Charmer — дизайн медиа, которые читают",
  description:
    "Помогаем крупным компаниям создавать корпоративные медиа и контентные платформы. От стратегии и визуального языка до запуска и развития продукта.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${evenMono.variable} ${pelikan.variable}`}>
      <body>{children}</body>
    </html>
  );
}
