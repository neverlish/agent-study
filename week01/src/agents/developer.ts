import { requestGoogle } from './google';

export async function getDeveloperLinks(keyword: string) {
  const searched = await requestGoogle(keyword);

  return searched.map((i: any) => [`${i.title}: ${i.link}`]).join('\n');
}