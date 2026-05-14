import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  // Use a global variable to ensure singleton in the browser
  if (typeof window !== 'undefined') {
    if ((window as any).supabaseClient) {
      return (window as any).supabaseClient;
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Fail fast so Supabase auth-js doesn't throw an unhelpful handleError stack trace.
    throw new Error(
      "Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey);


  if (typeof window !== 'undefined') {
    (window as any).supabaseClient = client;
  }

  return client;
};
