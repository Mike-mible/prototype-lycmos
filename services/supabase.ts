
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jgbucdprdotewgpjamae.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnVjZHByZG90ZXdncGphbWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MjEwMjYsImV4cCI6MjA4NDM5NzAyNn0.vTEk991ZL9Sfra617lHUVvaOssRPiaeQnMMFyLPnPTk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
