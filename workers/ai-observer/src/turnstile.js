const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken({ token, remoteIp, secret, fetchImpl = fetch }) {
  if (!token || !secret) {
    return { success: false, 'error-codes': ['missing-input'] };
  }

  try {
    const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: remoteIp,
      }),
    });

    return await response.json();
  } catch {
    return { success: false, 'error-codes': ['internal-error'] };
  }
}
