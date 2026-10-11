import Link from 'next/link';
import { RegistrationForm, type RegistrationFormMode } from '@/components/organisms/RegistrationForm';
import { textStyle } from '@/design-system';

interface RegistrationPageProps {
  searchParams: Promise<{ confirmar?: string; completar?: string }>;
}

export default async function RegistrationPage({ searchParams }: RegistrationPageProps) {
  const query = await searchParams;
  const mode: RegistrationFormMode = query.confirmar === '1'
    ? 'confirm'
    : query.completar === '1'
      ? 'complete'
      : 'signup';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-container-reading flex-col justify-center gap-6 px-8 py-10">
      <Link href="/" className={`${textStyle('body-strong')} self-start`}>NutriDiet Profissional</Link>
      <RegistrationForm mode={mode} />
    </main>
  );
}
