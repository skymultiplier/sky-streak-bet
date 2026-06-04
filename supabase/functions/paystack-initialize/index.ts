const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, amount, reference, callback_url } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return new Response(JSON.stringify({ error: 'amount must be a positive number (USD)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
    const secret = rawSecret?.trim().replace(/^Bearer\s+/i, '');

    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Paystack is not configured yet. Please add the Paystack secret key.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!/^sk_(test|live)_/i.test(secret)) {
      console.error('PAYSTACK_SECRET_KEY has an invalid format. It must start with sk_test_ or sk_live_.');
      return new Response(JSON.stringify({ error: 'Paystack secret key is invalid. Use the secret key that starts with sk_test_ or sk_live_.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Paystack expects the smallest currency unit (kobo for NGN).
    // Treat incoming amount as USD-equivalent at 1 USD = 1500 NGN (adjust as needed).
    const ngnKobo = Math.round(amountNum * 1500 * 100);

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: ngnKobo,
        currency: 'NGN',
        reference: reference || `sm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        callback_url,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      console.error('Paystack error:', data);
      return new Response(JSON.stringify({ error: data.message || 'Paystack init failed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    console.error('paystack-initialize exception:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
