// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

console.log("Hello from Functions!")

const testHTMLContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@^2.0/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body>
      <div class="p-4 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
          <div>
              <div class="text-xl font-medium text-black">HTML -> PNG Example</div>
              <p class="text-gray-500">This PNG file is converted from HTML content!</p>
              <p class="text-black test-sm italic">implemented by Andrii</p>
          </div>
      </div>
  </body>
  </html>
`

Deno.serve(async (req) => {
  const apiUrl = 'https://hcti.io/v1/image'
  const USER_ID = '5a8c6c05-cfd7-4ff4-9e86-22e2d00b035d'
  const API_KEY = 'd08fdf7c-b26d-4dd0-ac17-0352cf1158ec'

  try {
    const json = {
      html: testHTMLContent
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify(json),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(USER_ID + ":" + API_KEY)}`
      }
    })
    const data = await response.json()
    return new Response(
      JSON.stringify(data.url),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
      console.error('Error:', error);
      const response = new Response('Internal Server Error', { status: 500 });
      return response;
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/html2png' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
