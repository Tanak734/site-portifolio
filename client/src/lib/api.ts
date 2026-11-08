// Wrapper HTTP conforme docs/front/docs-frontend.md §5
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Envia e recebe o Cookie HTTP-only com o JWT
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Erro de comunicação com o servidor' }));
    throw new Error(err.message || `Erro HTTP ${response.status}`);
  }

  return response.json();
}
