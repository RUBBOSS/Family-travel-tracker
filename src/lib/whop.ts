import 'server-only';

/**
 * Whop license validation — LIVE.
 *
 * Product:  prod_pX9s2f5LQAcdj (whop.com/family-travel-tracker)
 * Plans:    Family plan_wFpzmzIAk893C ($29 one-time)
 *           Pro    plan_4LhNiPWZUrBCT ($9/mo)
 *           Agency plan_ee5Iu88nbRC0j ($49 one-time)
 *
 * Validation flow (current Whop API — the legacy validate_license route is
 * gone): retrieve the membership BY LICENSE KEY, then require a status that
 * grants access and a match on our product:
 *   GET https://api.whop.com/api/v2/memberships/{license_key}
 *   Authorization: Bearer WHOP_API_KEY
 *   200 -> { status, product_id / product, ... }
 *   404 -> unknown license
 */

const WHOP_API_BASE = 'https://api.whop.com/api/v2';

/** Membership statuses that grant app access. */
const VALID_STATUSES = new Set(['active', 'completed', 'trialing']);

export interface LicenseValidationResult {
  valid: boolean;
  status?: string;
  expiresAt?: string | null;
  error?: 'missing_key' | 'invalid_key' | 'wrong_product' | 'inactive' | 'whop_error' | 'network_error';
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
    const res = await fetch(`${WHOP_API_BASE}/memberships/${encodeURIComponent(trimmed)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 404) {
      return { valid: false, error: 'invalid_key' };
    }

    if (!res.ok) {
      return { valid: false, error: 'whop_error' };
    }

    const membership = (await res.json()) as {
      status?: string;
      expires_at?: string | null;
      product_id?: string;
      product?: { id?: string } | string;
    };

    const membershipProductId =
      typeof membership.product === 'object' ? membership.product?.id : membership.product;
    if (membership.product_id !== productId && membershipProductId !== productId) {
      return { valid: false, error: 'wrong_product' };
    }

    if (!membership.status || !VALID_STATUSES.has(membership.status)) {
      return { valid: false, status: membership.status, error: 'inactive' };
    }

    return {
      valid: true,
      status: membership.status,
      expiresAt: membership.expires_at ?? null,
    };
  } catch {
    return { valid: false, error: 'network_error' };
  }
}
