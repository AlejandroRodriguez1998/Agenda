import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PUSH_ENDPOINT = Deno.env.get('PUSH_ENDPOINT')!

// Minutos antes del evento para avisar
const ADELANTO_MINUTOS = 10

serve(async () => {
  const ahora = new Date()
  const dentroDeUnRato = new Date(ahora.getTime() + ADELANTO_MINUTOS * 60 * 1000)

  const desde = ahora.toISOString()
  const hasta = dentroDeUnRato.toISOString()

  const horariosUrl = `${SUPABASE_URL}/rest/v1/horario?fecha=gte.${desde}&fecha=lte.${hasta}&select=id,titulo,fecha,user_id`

  const res = await fetch(horariosUrl, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })

  if (!res.ok) {
    console.error('❌ Error al obtener horarios desde Supabase')
    return new Response('Error al obtener horarios', { status: 500 })
  }

  const horarios = await res.json()

  for (const item of horarios) {
    const payload = {
      userId: item.user_id,
      title: '⏰ Recordatorio',
      body: `Tienes “${item.titulo}” a las ${new Date(item.fecha).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    }

    await fetch(PUSH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  return new Response(`✅ Revisados ${horarios.length} horarios`, { status: 200 })
})
