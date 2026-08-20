import axios from "axios";
import { createClient } from "@/lib/supabase/client";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  timeout: 10000
});

api.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
