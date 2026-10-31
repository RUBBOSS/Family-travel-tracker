import 'server-only';

/**
 * Whop license validation — staged integration.
 *
 * Dormant until WHOP_API_KEY + WHOP_PRODUCT_ID are set in the environment.
 * When they are absent, `isLicensingEnabled()` returns false and the app
 * behaves exactly as an unlicensed open product (current behavior).
 *
 * Endpoint reference (verify against current Whop docs on activation):
 *   POST https://api.whop.com/api/v2/memberships/validate_license
 *   Headers: Authorization: Bearer <WHOP_API_KEY>
 *   Body:    { license_key, product_id }
 *   200 -> { valid: true, membership: { status, expires_at, ... } }
 *   4xx -> invalid / unknown license
 */

export interface LicenseValidationResult {
  valid: boolean;
  status?: string;
  expiresAt?: string | null;
  error?: string;
}

export function isLicensingEnabled(): boolean {
  return Boolean(process.env.WHOP_API_KEY && process.env.WHOP_PRODUCT_ID);
}

/**
 * Per-tier Whop checkout links. Each tier can have its own URL
 * (NEXT_PUBLIC_WHOP_CHECKOUT_FAMILY / _PRO / _AGENCY), falling back to the
 * generic NEXT_PUBLIC_WHOP_CHECKOUT_URL. Nulls render as "coming soon".
 */
export function getCheckoutUrls(): { family: string | null; pro: string | null; agency: string | null } {
  const generic = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_URL ?? null;
  return {
    family: process.env.NEXT_PUBLIC_WHOP_CHECKOUT_FAMILY ?? generic,
    pro: process.env.NEXT_PUBLIC_WHOP_CHECKOUT_PRO ?? generic,
    agency: process.env.NEXT_PUBLIC_WHOP_CHECKOUT_AGENCY ?? generic,
  };
}

export async function validateLicenseKey(licenseKey: string): Promise<LicenseValidationResult> {
  const apiKey = process.env.WHOP_API_KEY;
  const productId = process.env.WHOP_PRODUCT_ID;

  if (!apiKey || !productId) {
    // Licensing not configured — open access (staged mode).
    return { valid: true, status: 'unconfigured' };
  }

  const trimmed = licenseKey.trim();
  if (!trimmed) {
    return { valid: false, error: 'missing_key' };
  }

  try {
    const res = await fetch('https://api.whop.com/api/v2/memberships/validate_license', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ license_key: trimmed, product_id: productId }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        valid?: boolean;
        membership?: { status?: string; expires_at?: string | null };
      };
      if (data.valid) {
        return {
          valid: true,
          status: data.membership?.status,
          expiresAt: data.membership?.expires_at ?? null,
        };
      }
      return { valid: false, error: 'invalid_key' };
    }

    if (res.status === 404 || res.status === 400) {
      return { valid: false, error: 'invalid_key' };
    }

    return { valid: false, error: `whop_error_${res.status}` };
  } catch {
    return { valid: false, error: 'network_error' };
  }
}
