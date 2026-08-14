import { Database, ExternalLink, KeyRound, TerminalSquare } from 'lucide-react'
import { Brand } from '../components/Brand'

export function SetupRequired() {
  return (
    <main className="setup-page">
      <Brand />
      <section className="setup-card">
        <span className="setup-icon"><Database size={24} /></span>
        <p className="eyebrow">Un último paso</p>
        <h1>Conecta Duet con Supabase</h1>
        <p>
          La aplicación ya está lista. Solo necesita las credenciales públicas de
          vuestro proyecto para guardar y proteger el contenido.
        </p>
        <ol className="setup-steps">
          <li>
            <span><Database size={18} /></span>
            <div><strong>Crea un proyecto</strong><p>En Supabase y ejecuta la migración de la carpeta <code>supabase/migrations</code>.</p></div>
          </li>
          <li>
            <span><KeyRound size={18} /></span>
            <div><strong>Añade las claves</strong><p>Copia <code>.env.example</code> como <code>.env.local</code> y completa sus dos valores.</p></div>
          </li>
          <li>
            <span><TerminalSquare size={18} /></span>
            <div><strong>Arranca la app</strong><p>Reinicia <code>npm run dev</code> después de guardar el entorno.</p></div>
          </li>
        </ol>
        <a className="button button-primary" href="https://supabase.com/dashboard" rel="noreferrer" target="_blank">
          Abrir Supabase <ExternalLink size={16} />
        </a>
      </section>
    </main>
  )
}
