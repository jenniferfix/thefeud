export const getSafeRedirectPath = (
  redirect: string | null | undefined,
  fallback = '/',
) => {
  if (!redirect?.startsWith('/') || redirect.startsWith('//')) {
    return fallback;
  }

  return redirect;
};
