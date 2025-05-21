import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: queue } = await supabase.from('notification_queue').select('*').limit(10);

  if (!queue || queue.length === 0) return new Response('No notifications to send');

  for (const notification of queue) {
    const { user_id, title, body, data } = notification;

    const { data: user } = await supabase.from('users').select('push_token').eq('id', user_id).single();

    if (!user?.push_token) continue;

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.push_token,
        sound: 'default',
        title,
        body,
        data,
      }),
    });

    // Optionally delete sent notification
    await supabase.from('notification_queue').delete().eq('id', notification.id);
  }

  return new Response('Notifications processed');
});
