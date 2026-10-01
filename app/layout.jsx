import "./globals.css";

export const metadata = {
  title: "Painel de Vagas · Eliel Cezar",
  description: "Vagas coletadas, triadas e arquivadas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
