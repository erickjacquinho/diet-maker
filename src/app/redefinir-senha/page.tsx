import Link from 'next/link';
import { ResetPasswordForm } from '@/components/organisms/ResetPasswordForm';
import { textStyle } from '@/design-system';

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-container-reading flex-col justify-center gap-6 px-8 py-10">
      <Link href="/" className={`${textStyle('body-strong')} self-start`}>NutriDiet Profissional</Link>
      <ResetPasswordForm />
    </main>
  );
}
