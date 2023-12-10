import { openai } from "../openai";
import { requestGoogle } from "./google";
import ogs from 'open-graph-scraper';
import jsdom from "jsdom";
import { convert } from 'html-to-text';
import { ChatCompletionMessageParam } from "openai/resources";

async function extractBody(link: string) {
  const res = await ogs({url: link})
  const dom = new jsdom.JSDOM(res.html);
  const doc = dom.window.document;
  const scripts = doc.querySelectorAll('script');
  for (const script of scripts) {
    script.remove();
  }
  const styles = doc.querySelectorAll('style');
  for (const script of styles) {
    script.remove();
  }

  const body = doc.querySelector('body')?.textContent as string;
  const bodyText = convert(body)
  
  return bodyText
}

async function generateSummary(companyName: string, serviceName: string, htmls: string[]) {
  const messages: Array<ChatCompletionMessageParam> = [
    {
      role: "system",
      content:
        `You are a helpful assistant. You have to summary the service of ${companyName} about ${serviceName} in 200 words. I will give you 1 minutes. explain in korean`,
    },
    {
      role: "user",
      content: htmls.join('\n').slice(0, 4000),
    }
  ];
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
  });
  return {
    serviceName,
    content: response.choices[0].message.content
  }
}

export async function describeService(companyName: string, serviceNames: string[]) {
  const result = []
  for (const serviceName of serviceNames) {
    const searched = await requestGoogle(`${companyName}의 ${serviceName} 서비스 소개`);
    if (searched) {
      const htmls = []
      for (const item of searched.slice(0, 4)) {
        if (item.link.includes('.pdf')) {
          continue;
        }
        const body = await extractBody(item.link)
        
        htmls.push(body)
      }
      const summary = await generateSummary(companyName, serviceName, htmls)
      result.push(summary)
    }
    
  }
  return result.map((i) => `${i.serviceName}: ${i.content}`).join('\n\n');
}