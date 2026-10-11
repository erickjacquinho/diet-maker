import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecoverPasswordPage from '@/app/recuperar-senha/page';
import ResetPasswordPage from '@/app/redefinir-senha/page';
import { RecoveryPasswordForm } from '@/components/organisms/RecoveryPasswordForm';
import { ResetPasswordForm } from '@/components/organisms/ResetPasswordForm';

const csrfToken = 'a'.repeat(43);

function queueFetch(...responses: Response[]) {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(responses.shift() ?? Response.json({})));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function waitForReady(label: string) {
  await waitFor(() => expect(screen.getByRole('button', { name: label })).toBeEnabled());
}

describe('password recovery forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('exposes both public recovery routes with their form and return link', () => {
    queueFetch(Response.json({ csrfToken }), Response.json({ csrfToken }));
    const requestPage = render(RecoverPasswordPage());
    expect(screen.getByRole('heading', { name: 'Recuperar senha' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute('href', '/login');
    requestPage.unmount();

    render(ResetPasswordPage());
    expect(screen.getByRole('heading', { name: 'Defina uma nova senha' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute('href', '/login');
  });

  it('requests recovery by email and shows the same conditional success state with a login path', async () => {
    const fetchMock = queueFetch(
      Response.json({ csrfToken }),
      Response.json({ message: 'Se o endereço puder receber uma recuperação, as instruções serão enviadas.' }, { status: 202 }),
    );
    render(<RecoveryPasswordForm />);

    const email = await screen.findByLabelText('E-mail');
    expect(email).toHaveAttribute('autocomplete', 'email');
    fireEvent.change(email, { target: { value: 'ana@example.test' } });
    await waitForReady('Enviar instruções');
    fireEvent.submit(screen.getByRole('form', { name: 'Recuperar senha' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Se o endereço puder receber uma recuperação, as instruções serão enviadas.');
    expect(screen.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute('href', '/login');
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/recovery', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toEqual({ email: 'ana@example.test', csrfToken });
  });

  it('associates and focuses a malformed email without making a request', async () => {
    const fetchMock = queueFetch(Response.json({ csrfToken }));
    render(<RecoveryPasswordForm />);

    const email = await screen.findByLabelText('E-mail');
    fireEvent.change(email, { target: { value: 'bad-address' } });
    await waitForReady('Enviar instruções');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    const error = screen.getByText('Informe um e-mail válido.');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email.getAttribute('aria-describedby')).toContain(error.id);
    await waitFor(() => expect(document.activeElement).toBe(email));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the request form available and shows a generic failure when the service is unavailable', async () => {
    queueFetch(Response.json({ csrfToken }), Response.json({ code: 'INTERNAL_ERROR' }, { status: 503 }));
    render(<RecoveryPasswordForm />);

    fireEvent.change(await screen.findByLabelText('E-mail'), { target: { value: 'ana@example.test' } });
    await waitForReady('Enviar instruções');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível solicitar a recuperação agora. Tente novamente.');
    expect(screen.getByRole('button', { name: 'Enviar instruções' })).toBeEnabled();
    expect(document.activeElement).toBe(screen.getByRole('alert'));
  });

  it('announces pending state and blocks duplicate recovery submissions', async () => {
    let finishRequest!: (response: Response) => void;
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ csrfToken }))
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { finishRequest = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    render(<RecoveryPasswordForm />);

    fireEvent.change(await screen.findByLabelText('E-mail'), { target: { value: 'ana@example.test' } });
    await waitForReady('Enviar instruções');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar instruções' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar instruções' })).toBeDisabled());
    expect(screen.getByRole('form', { name: 'Recuperar senha' })).toHaveAttribute('aria-busy', 'true');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fireEvent.submit(screen.getByRole('form', { name: 'Recuperar senha' }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    finishRequest(Response.json({ message: 'accepted' }, { status: 202 }));
    expect(await screen.findByRole('status')).toHaveTextContent('Se o endereço puder receber uma recuperação, as instruções serão enviadas.');
  });

  it('validates password confirmation before posting and associates its error', async () => {
    const fetchMock = queueFetch(Response.json({ csrfToken }));
    render(<ResetPasswordForm />);

    const password = await screen.findByLabelText('Nova senha');
    const confirmation = screen.getByLabelText('Confirme a nova senha');
    fireEvent.change(password, { target: { value: 'senha nova segura 123' } });
    fireEvent.change(confirmation, { target: { value: 'outra senha segura 123' } });
    await waitForReady('Alterar senha');
    fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));

    const error = screen.getByText('As senhas precisam ser iguais.');
    expect(confirmation).toHaveAttribute('aria-invalid', 'true');
    expect(confirmation.getAttribute('aria-describedby')).toContain(error.id);
    await waitFor(() => expect(document.activeElement).toBe(confirmation));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('explains that an expired or used link needs a new request', async () => {
    queueFetch(
      Response.json({ csrfToken }),
      Response.json({ code: 'RECOVERY_LINK_INVALID', message: 'O link não pode mais ser usado. Solicite um novo link.' }, { status: 400 }),
    );
    render(<ResetPasswordForm />);

    fireEvent.change(await screen.findByLabelText('Nova senha'), { target: { value: 'senha nova segura 123' } });
    fireEvent.change(screen.getByLabelText('Confirme a nova senha'), { target: { value: 'senha nova segura 123' } });
    await waitForReady('Alterar senha');
    fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Este link expirou ou já foi usado. Solicite uma nova recuperação.');
    expect(document.activeElement).toBe(screen.getByRole('alert'));
    expect(screen.getByRole('link', { name: /solicitar outra recuperação/i })).toHaveAttribute('href', '/recuperar-senha');
    expect(screen.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute('href', '/login');
  });

  it('shows success and directs the user back to login', async () => {
    const fetchMock = queueFetch(
      Response.json({ csrfToken }),
      Response.json({ message: 'Senha alterada. Faça login com a nova senha.' }),
    );
    render(<ResetPasswordForm />);

    fireEvent.change(await screen.findByLabelText('Nova senha'), { target: { value: 'senha nova segura 123' } });
    fireEvent.change(screen.getByLabelText('Confirme a nova senha'), { target: { value: 'senha nova segura 123' } });
    await waitForReady('Alterar senha');
    fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Sua senha foi alterada. Entre com a nova senha.');
    expect(screen.getByRole('link', { name: 'Ir para o login' })).toHaveAttribute('href', '/login');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toEqual({
      password: 'senha nova segura 123',
      passwordConfirmation: 'senha nova segura 123',
      csrfToken,
    });
  });

  it('keeps submission disabled if CSRF preparation fails', async () => {
    queueFetch(Response.json({}, { status: 503 }));
    render(<RecoveryPasswordForm />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível preparar o formulário. Recarregue a página.');
    expect(screen.getByRole('button', { name: 'Enviar instruções' })).toBeDisabled();
  });
});
