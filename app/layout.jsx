import "./globals.css";
import "./minimal.css";

export const metadata = {
  title: "Painel de Vagas · Eliel Cezar",
  description: "Vagas coletadas, triadas e arquivadas",
};

// Aplica o estilo salvo antes da primeira pintura (evita "piscar" o estilo errado).
// "vidro" é o CSS base (padrão, sem classe); "minimal" ganha a classe estilo-minimal.
const aplicaEstilo = `try{if(localStorage.getItem("painel-estilo")==="minimal")document.documentElement.classList.add("estilo-minimal")}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: aplicaEstilo }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
