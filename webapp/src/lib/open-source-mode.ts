const parseOpenSourceFlag = (): boolean => {
  const raw =
    (typeof window === "undefined" ? process.env.OPEN_SOURCE_MODE : undefined) ??
    process.env.NEXT_PUBLIC_OPEN_SOURCE_MODE;

  if (!raw) {
    // Safe default for public/open-source distribution.
    return true;
  }

  return raw.trim().toLowerCase() !== "false";
};

export const OPEN_SOURCE_MODE = parseOpenSourceFlag();

export const BILLING_ENABLED = !OPEN_SOURCE_MODE && Boolean(process.env.STRIPE_SECRET_KEY);

export const SUPABASE_ENABLED =
  !OPEN_SOURCE_MODE &&
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

