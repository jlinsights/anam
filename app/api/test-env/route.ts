export async function GET() {
  return Response.json({
    // kakao_api_key: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
    //   ? "exists"
    //   : "missing",
    // kakao_key_length: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY?.length || 0,
    airtable_key: process.env.AIRTABLE_API_KEY ? 'exists' : 'missing',
    airtable_base: process.env.AIRTABLE_BASE_ID ? 'exists' : 'missing',
  })
}
