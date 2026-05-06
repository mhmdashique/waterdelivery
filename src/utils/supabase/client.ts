import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  // Use a global variable to ensure singleton in the browser
  if (typeof window !== 'undefined') {
    if ((window as any).supabaseClient) {
      return (window as any).supabaseClient;
    }
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "placeholder",
  );

  if (typeof window !== 'undefined') {
    (window as any).supabaseClient = client;
  }

  return client;
};
