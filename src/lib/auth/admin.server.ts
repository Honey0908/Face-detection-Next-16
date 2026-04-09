import { cookies } from 'next/headers';
import { isAdminRole, isAuthEnforced } from './admin';

const ROLE_COOKIE_NAME = 'user-role';

export async function isAdminFromCookies(): Promise<boolean> {
  if (!isAuthEnforced()) {
    return true;
  }

  const cookieStore = await cookies();
  const role = cookieStore.get(ROLE_COOKIE_NAME)?.value;

  return isAdminRole(role);
}
