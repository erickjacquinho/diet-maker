import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/page';
import LoginPage from '@/app/login/page';
import RegistrationPage from '@/app/criar-conta/page';
import { SessionAwareAppShell } from '@/app/SessionAwareAppShell';
import { LoginForm } from '@/components/organisms/LoginForm';
import { RegistrationForm } from '@/components/organisms/RegistrationForm';

const mocks = vi.hoisted(() => {
  const session = {
    getSnapshot: vi.fn(() => ({ status: 'empty', syncState: 'unbound', account: null, accountId: null, runtime: null, fileName: null, hydration: 'pending', resumeFileName: null, error: null })),
    subscribe: vi.fn(() => () => undefined),
    restoreActiveProfile: vi.fn(async () => undefined),
    sync: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined),
  };
  return { replace: vi.fn(), pathname: '/' as string, session, getBrowserProfileSession: vi.fn(() => session) };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => mocks.pathname,
}));
vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserProfileSession: mocks.getBrowserProfileSession,
  revokePendingBrowserSession: vi.fn(async () => undefined),
}));

const csrfToken = 'a'.repeat(43);
const csrfResponse = () => Response.json({ csrfToken });

function queueFetch(...responses: Response[]) {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(responses.shift() ?? Response.json({})));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function waitForReady(buttonName: string) {
  await waitFor(() => expect(screen.getByRole('button', { name: buttonName })).toBeEnabled());
}

async function chooseExperience(label: string) {
  const trigger = screen.getByLabelText('Experiência profissional');
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('option', { name: label }));
  await waitFor(() => expect(trigger).toHaveTextContent(label));
}

function fillProfessionalProfile() {
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Sobrenome'), { target: { value: 'Lima' } });
  fireEvent.change(screen.getByLabelText('Média de pacientes por mês'), { target: { value: '12.5' } });
}

describe('landing, cadastro e login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('apresenta a landing pública e os acessos para login e cadastro', () => {
    render(HomePage());

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Landing page', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /criar conta/i })).toHaveAttribute('href', '/criar-conta');
  });

  it('mantém rotas públicas fora da hidratação do profile clínico', () => {
    mocks.pathname = '/';
    render(<SessionAwareAppShell><main>Landing pública</main></SessionAwareAppShell>);

    expect(screen.getByRole('main')).toHaveTextContent('Landing pública');
    expect(mocks.getBrowserProfileSession).not.toHaveBeenCalled();
    expect(mocks.session.getSnapshot).not.toHaveBeenCalled();
    expect(mocks.session.restoreActiveProfile).not.toHaveBeenCalled();
  });

  it('liga os campos de login, envia CSRF e navega para o destino permitido', async () => {
    const fetchMock = queueFetch(csrfResponse(), Response.json({ destination: '/dashboard' }));
    render(<LoginForm />);

    const email = await screen.findByLabelText('E-mail');
    const password = screen.getByLabelText('Senha');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('link', { name: /esqueceu a senha/i })).toHaveAttribute('href', '/recuperar-senha');

    fireEvent.change(email, { target: { value: 'ana@example.test' } });
    fireEvent.change(password, { target: { value: 'senha de teste' } });
    await waitForReady('Entrar');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/dashboard'));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/login', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toEqual({
      email: 'ana@example.test',
      password: 'senha de teste',
      csrfToken,
    });
  });

  it('mostra erro de autenticação sem expor resposta técnica', async () => {
    queueFetch(csrfResponse(), Response.json({ code: 'AUTH_REQUIRED', message: 'E-mail ou senha inválidos.' }, { status: 401 }));
    render(<LoginForm />);

    fireEvent.change(await screen.findByLabelText('E-mail'), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha de teste' } });
    await waitForReady('Entrar');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.');
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('routes an unrecognized login destination to the safe dashboard default', async () => {
    queueFetch(csrfResponse(), Response.json({ destination: 'https://attacker.example/collect' }));
    render(<LoginForm />);

    fireEvent.change(await screen.findByLabelText('E-mail'), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha de teste' } });
    await waitForReady('Entrar');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('anuncia login pendente e impede submissões concorrentes', async () => {
    let finishLogin!: (response: Response) => void;
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(csrfResponse())
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { finishLogin = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    render(<LoginForm />);

    fireEvent.change(await screen.findByLabelText('E-mail'), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha de teste' } });
    await waitForReady('Entrar');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled());
    expect(screen.getByRole('form')).toHaveAttribute('aria-busy', 'true');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    finishLogin(Response.json({ destination: '/dashboard' }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('renderiza cadastro, confirmação e conclusão conforme a rota e seus parâmetros', async () => {
    const landing = render(HomePage());
    expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument();
    landing.unmount();

    queueFetch(csrfResponse());
    render(await LoginPage());
    expect(screen.getByRole('heading', { name: 'Entrar na sua conta' })).toBeInTheDocument();
    await waitForReady('Entrar');
  });

  it('coleta todos os dados profissionais e informa envio sem revelar existência da conta', async () => {
    const fetchMock = queueFetch(csrfResponse(), Response.json({ message: 'Se for possível usar este e-mail, você receberá as instruções.' }, { status: 202 }));
    render(<RegistrationForm mode="signup" />);

    fillProfessionalProfile();
    await chooseExperience('Em anos');
    fireEvent.change(screen.getByLabelText('Anos de experiência'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText('Confirme o e-mail'), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha longa segura' } });
    fireEvent.change(screen.getByLabelText('Confirme a senha'), { target: { value: 'senha longa segura' } });
    expect(screen.getByLabelText('Senha')).toHaveAttribute('autocomplete', 'new-password');
    await waitForReady('Criar conta');
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Se for possível usar este e-mail, você receberá as instruções.');
    const body = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(body).toMatchObject({
      firstName: 'Ana',
      lastName: 'Lima',
      email: 'ana@example.test',
      averagePatientsPerMonth: 12.5,
      experience: { kind: 'years', value: 4.5 },
      csrfToken,
    });
  });

  it('exige faixa explícita e associa erros de seleção e confirmação de senha', async () => {
    queueFetch(csrfResponse());
    render(<RegistrationForm mode="signup" />);

    const experience = await screen.findByLabelText('Experiência profissional');
    fireEvent.keyDown(experience, { key: 'ArrowDown' });
    expect(await screen.findByRole('option', { name: 'De 1 a 6 meses' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'De 6 a 12 meses' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Em anos' })).toBeInTheDocument();
    fireEvent.keyDown(experience, { key: 'Escape' });

    fillProfessionalProfile();
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText('Confirme o e-mail'), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha longa segura' } });
    const passwordConfirmation = screen.getByLabelText('Confirme a senha');
    fireEvent.change(passwordConfirmation, { target: { value: 'outra senha longa' } });
    await waitForReady('Criar conta');
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    const experienceError = screen.getByText('Selecione sua faixa de experiência.');
    expect(experienceError).toHaveTextContent('Selecione sua faixa de experiência.');
    expect(experience).toHaveAttribute('aria-invalid', 'true');
    expect(experience.getAttribute('aria-describedby')).toContain(experienceError.id);
    await chooseExperience('De 1 a 6 meses');
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    const error = screen.getByText('As senhas precisam ser iguais.');
    expect(error).toHaveTextContent('As senhas precisam ser iguais.');
    expect(passwordConfirmation).toHaveAttribute('aria-invalid', 'true');
    expect(passwordConfirmation.getAttribute('aria-describedby')).toContain(error.id);
    await waitFor(() => expect(document.activeElement).toBe(passwordConfirmation));
  });

  it('confirma o endereço somente no modo de confirmação', async () => {
    const fetchMock = queueFetch(csrfResponse(), Response.json({ message: 'E-mail confirmado. Faça login.' }));
    render(<RegistrationForm mode="confirm" />);

    expect(await screen.findByRole('heading', { name: 'Confirme seu e-mail' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument();
    await waitForReady('Confirmar e-mail');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar e-mail' }));

    expect(await screen.findByRole('status')).toHaveTextContent('E-mail confirmado. Agora você já pode entrar.');
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/confirm-email', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toEqual({ csrfToken });
  });

  it('conclui somente os dados profissionais após login verificado', async () => {
    const fetchMock = queueFetch(csrfResponse(), Response.json({ destination: '/dashboard' }));
    render(<RegistrationForm mode="complete" />);

    fillProfessionalProfile();
    await chooseExperience('De 6 a 12 meses');
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument();
    await waitForReady('Concluir cadastro');
    fireEvent.click(screen.getByRole('button', { name: 'Concluir cadastro' }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/dashboard'));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/complete-profile', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toMatchObject({
      firstName: 'Ana',
      lastName: 'Lima',
      averagePatientsPerMonth: 12.5,
      experience: { kind: 'months_6_12' },
      csrfToken,
    });
  });

  it.each([
    [{ confirmar: '1' }, 'confirm'],
    [{ completar: '1' }, 'complete'],
    [{}, 'signup'],
  ] as const)('seleciona modo %s na página de cadastro', async (searchParams, expectedMode) => {
    const page = await RegistrationPage({ searchParams: Promise.resolve(searchParams) });
    queueFetch(csrfResponse());
    render(page);
    if (expectedMode === 'confirm') expect(await screen.findByRole('heading', { name: 'Confirme seu e-mail' })).toBeInTheDocument();
    if (expectedMode === 'complete') expect(await screen.findByRole('heading', { name: 'Conclua seu cadastro' })).toBeInTheDocument();
    if (expectedMode === 'signup') expect(await screen.findByRole('heading', { name: 'Crie sua conta profissional' })).toBeInTheDocument();
  });
});
