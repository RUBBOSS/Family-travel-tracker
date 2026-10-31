import { NextRequest, NextResponse } from 'next/server';
import { getCheckoutUrls, isLicensingEnabled, validateLicenseKey } from '@/lib/whop';

// GET /api/license/validate - is licensing turned on for this deployment?
export async function GET() {
  return NextResponse.json({ enabled: isLicensingEnabled(), checkoutUrls: getCheckoutUrls() });
}

// POST /api/license/validate - validate a Whop license key
export async function POST(request: NextRequest) {
  try {
    const { licenseKey } = await request.json();

    if (!isLicensingEnabled()) {
      // Staged mode: no Whop credentials configured -> open access.
      return NextResponse.json({ enabled: false, valid: true, status: 'unconfigured' });
    }

    const result = await validateLicenseKey(typeof licenseKey === 'string' ? licenseKey : '');
    return NextResponse.json({ enabled: true, ...result });
  } catch {
    return NextResponse.json({ enabled: isLicensingEnabled(), valid: false, error: 'bad_request' }, { status: 400 });
  }
}
