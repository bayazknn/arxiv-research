// hooks/use-supabase-client.ts
import { useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const createSupabaseClient = () => {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
  );
};

export const useSupabaseClient = () => {
  return useMemo(() => createSupabaseClient(), []);
};
