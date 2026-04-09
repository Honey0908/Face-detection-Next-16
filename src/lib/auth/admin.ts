import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROLE = 'admin';
const ROLE_COOKIE_NAME = 'user-role';
const ROLE_HEADER_NAME = 'x-user-role';

export function isAuthEnforced(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.ENFORCE_ADMIN_AUTH === 'true'
  );
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === ADMIN_ROLE;
}

export function getRoleFromRequest(request: NextRequest): string | null {
  const headerRole = request.headers.get(ROLE_HEADER_NAME);
  if (headerRole) {
    return headerRole;
  }

  return request.cookies.get(ROLE_COOKIE_NAME)?.value ?? null;
}

export function requireAdminApiAccess(
  request: NextRequest,
): NextResponse | null {
  if (!isAuthEnforced()) {
    return null;
  }

  const role = getRoleFromRequest(request);

  if (!role) {
    return NextResponse.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
      { status: 401 },
    );
  }

  if (!isAdminRole(role)) {
    return NextResponse.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Admin access required',
      },
      { status: 403 },
    );
  }

  return null;
}
