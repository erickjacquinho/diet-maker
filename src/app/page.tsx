import { Button } from '@/components/atoms/Button';
import { textStyle } from '@/design-system';

export default function LandingPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-container-page grid-cols-12 content-center gap-10 px-8 py-10">
      <section className="col-span-7 flex flex-col gap-6">
        <p className={textStyle('overline')}>NutriDiet Profissional</p>
        <h1 className={textStyle('page-title')}>Landing page</h1>
        <p className={textStyle('body-large')}>
          Entre na sua conta profissional para acessar seus saves.
        </p>
        <p className={textStyle('body-secondary')}>
          Os arquivos e dados clínicos continuam no seu computador. A conta organiza o acesso aos saves.
        </p>
        <div className="flex items-center gap-3">
          <Button asChild variant="primary">
            <a href="/criar-conta">Criar conta</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/login">Entrar</a>
          </Button>
        </div>
      </section>

      <aside aria-label="Como funciona o acesso" className="col-span-5 flex flex-col gap-6 border-l border-border-divider pl-10">
        <h2 className={textStyle('section-title')}>Acesso profissional</h2>
        <ol className="flex flex-col gap-4">
          <li className="flex flex-col gap-1">
            <span className={textStyle('body-strong')}>1. Conta</span>
            <span className={textStyle('body-secondary')}>Entre ou crie uma conta com seu e-mail.</span>
          </li>
          <li className="flex flex-col gap-1">
            <span className={textStyle('body-strong')}>2. Confirmação</span>
            <span className={textStyle('body-secondary')}>Confirme seu endereço para proteger o acesso.</span>
          </li>
          <li className="flex flex-col gap-1">
            <span className={textStyle('body-strong')}>3. Seus saves</span>
            <span className={textStyle('body-secondary')}>Consulte os arquivos locais vinculados à conta.</span>
          </li>
        </ol>
      </aside>
    </main>
  );
}
