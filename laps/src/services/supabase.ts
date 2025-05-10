import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ficgbuixoecfbkpqpwkx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpY2didWl4b2VjZmJrcHFwd2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMjE0NjUsImV4cCI6MjA2MTY5NzQ2NX0.tzptLcKgeUdAoQjTtQmK4U_qAhViGRr_AdzOMTkxynA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 