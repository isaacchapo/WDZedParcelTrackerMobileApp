import { supabase } from '@/utils/supabaseClient';

export const logActivity = async (
  userId: string,
  action: string,
  metadata?: object
) => {
  const { error } = await supabase.from('activity_logs').insert([
    {
      user_id: userId,
      action,
      metadata,
    },
  ]);

  if (error) {
    console.error('Logging error:', error.message);
  }
};
