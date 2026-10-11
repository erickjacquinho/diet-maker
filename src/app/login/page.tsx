import Link from 'next/link';
import { LoginForm } from '@/components/organisms/LoginForm';
import { textStyle } from '@/design-system';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-container-reading flex-col justify-center gap-6 px-8 py-10">
      <Link href="/" className={`${textStyle('body-strong')} self-start`}>NutriDiet Profissional</Link>
      <section className="flex flex-col gap-6" aria-labelledby="login-title">
        <header className="flex flex-col gap-2">
          <h1 id="login-title" className={textStyle('page-title')}>Entrar na sua conta</h1>
          <p className={textStyle('body-secondary')}>Acesse os saves vinculados à sua conta profissional.</p>
        </header>
        <LoginForm />
        <p className={textStyle('body-secondary')}>
          Ainda não tem uma conta? <Link href="/criar-conta" className={textStyle('link-inline')}>Criar conta</Link>
        </p>
      </section>
    </main>
  );
}
