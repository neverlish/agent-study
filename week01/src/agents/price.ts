import { requestGoogle } from "./google";
import urlMetadata from 'url-metadata';

export async function productPrice(shopName: string, productName: string) {
  const searched = await requestGoogle(`${shopName} - ${productName}`);
  
  for (const item of searched) {
    const res = await urlMetadata(item.link) as any;
    if (res.title.includes(productName)) {
      return res['product:price:amount']
    }
  }
  throw new Error("Not found")
}