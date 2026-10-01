import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://qumindqmcvsoxivitker.supabase.co";
const supabasePublishableKey = "sb_publishable_Ck9vpsB7hs5VW7Hs-6uUDQ_5DV1nSSy";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
