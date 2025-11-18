export interface GoogleUser {
  login_status: 'success' | 'failed';
  user_name: string;
  email: string;
  user_id: string;
  profile_image?: string;
}

const AUTH_KEY = 'lab_generator_auth';

export function saveAuthUser(user: GoogleUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getAuthUser(): GoogleUser | null {
  try {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth) : null;
  } catch (error) {
    console.error('Error loading auth user:', error);
    return null;
  }
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  const user = getAuthUser();
  return user !== null && user.login_status === 'success';
}
