// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { h, renderSSR } from 'https://deno.land/x/nano_jsx/mod.ts';

console.log("Hello from Functions!")

// Helper function to get the month abbreviation
const getMonthAbbreviation = (monthIndex: number) => {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return months[monthIndex];
};

const formatDateRange = (startDateString: string, endDateString: string) => {
  // Parse the start and end dates
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  // Extract components of the start and end dates
  const startMonth = getMonthAbbreviation(startDate.getMonth());
  const startDay = startDate.getDate();
  const endMonth = getMonthAbbreviation(endDate.getMonth());
  const endDay = endDate.getDate();
  const year = startDate.getFullYear();

  // Construct the formatted date range string
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

const formatDay = (date) => {
  const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return weekday[date.getDay()]
}

const getDateArray = (startDateStr, endDateStr) => {
  const dateArray: Date[] = [];
  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Push a new Date object so that we don't reference the same date
    dateArray.push(new Date(currentDate));
    // Add one day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}

const Day = (thisDate, plannedDates, completedDates) => {
  let status = 'no-plan'
  let mins = 0
  let minsParagraph = `<p></p>`

  const pDates = plannedDates.map((pDate) => new Date(pDate.date).toString())
  const cDates = completedDates.map((cDate) => new Date(cDate.date).toString())
  const date = thisDate?.toString()
  if (pDates.find((pDate) => pDate === date)) {
    status = 'planned'
    mins = plannedDates.find((pDate) => new Date(pDate.date).toString() === date).minutes
    minsParagraph = `<p class="text-lg font-bold text-blue-500">${mins} mins</p>`
  }
  if (cDates.find((cDate) => cDate === date)) {
    status = 'done'
    mins = completedDates.find((cDate) => new Date(cDate.date).toString() === date).minutes
    minsParagraph = `<div class="flex items-center text-base font-bold text-blue-500">&#10003;	${mins} mins</div>`
  }

  const statusClasses = {
    'no-plan': 'border-4 border-dotted border-gray-500 bg-gray-300',
    'planned': 'border-4 border-blue-500 bg-white',
    'done': 'bg-blue-500',
  };

  return (
    `<div class="flex flex-col gap-y-10 items-center">
      <p class="text-2xl font-bold leading-normal text-black">${formatDay(thisDate)}</p>
      <span class="rounded-full h-12 w-12 flex items-center justify-center ${statusClasses[status]}"></span>
      ${minsParagraph}
    </div>`
  );
};

const WeeklyCardioReport = (startDate: string, endDate: string, plannedDates: any, completedDates: any) => {
  const completedMinutes = completedDates.reduce((sum, date) => sum + date.minutes, 0);
  const targetMinutes = plannedDates.reduce((sum, date) => sum + date.minutes, 0)
  const percentageCompleted = Math.round((completedMinutes / targetMinutes) * 100);
  const minutesToGo = targetMinutes - completedMinutes;

  return (`
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@^2.0/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body>
        <div class="max-w-6xl mx-auto px-10 py-10 border border-gray-200 rounded shadow">
          <div class="flex flex-col gap-y-5 items-center">
            <div class="w-full flex text-2xl font-bold leading-normal text-black">${formatDateRange(startDate, endDate)}</div>
            <div class="w-full flex justify-between">
              <div class="flex gap-10">
              ${getDateArray(startDate, endDate).map((date) => Day(date, plannedDates, completedDates)).join("")}
              </div>
              <div class="flex flex-col gap-y-5">
                <div class='flex flex-col'>
                  <div class="flex gap-2 items-center">
                    <p class="text-5xl font-extrabold text-black">${percentageCompleted}</p>
                    <p class="text-2xl text-black">%</p>
                  </div>
                  <p class="text-2xl text-gray-400">Completed</p>
                </div>
                <div class='flex flex-col'>
                  <div class="flex gap-2 items-center">
                    <p class="text-5xl font-extrabold text-gray-400">${minutesToGo}</p>
                    <p class="text-2xl text-gray-400">m</p>
                  </div>
                  <p class="text-2xl text-gray-400">To go</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </body>
      </html>
    `
  );
};


Deno.serve(async (req) => {
  const requestData = await req.json();

  // request data example

  // const from = '2024-3-4'
  // const to = '2024-3-10'
  // const pDates = [
  //   {
  //     date: "2024-3-6",
  //     minutes: 50
  //   },
  //   {
  //     date: "2024-3-8",
  //     minutes: 50
  //   },
  //   {
  //     date: "2024-3-9",
  //     minutes: 50
  //   },
  // ]

  // const cDates = [
  //   {
  //     date: '2024-3-6',
  //     minutes: 50
  //   }
  // ]
  const { from, to, pDates, cDates } = requestData;
  const apiUrl = 'https://hcti.io/v1/image'
  const USER_ID = '5a8c6c05-cfd7-4ff4-9e86-22e2d00b035d'
  const API_KEY = 'd08fdf7c-b26d-4dd0-ac17-0352cf1158ec'

  const htmlContent = WeeklyCardioReport(from, to, pDates, cDates)

  try {
    const json = {
      html: htmlContent
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generateHTMLAndConvertToPNG' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
