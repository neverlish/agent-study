export async function requestGoogle(keyword: string) {  
  const fetched = await fetch(
    'https://www.googleapis.com/customsearch/v1?' + new URLSearchParams({
      q: keyword,
      key: process.env.GOOGLE_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
    } as any)
  )
  const result: any = await fetched.json();
  return result.items;
}
