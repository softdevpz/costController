import "./globals.css";

export const metadata = {
  title: "Budżet budowy",
  description: "Zarządzanie budżetem i dokumentacją budowy domu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
