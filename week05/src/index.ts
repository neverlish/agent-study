import fs from 'fs';
import { Browser, Builder } from 'selenium-webdriver';
import * as firefox from "selenium-webdriver/firefox";
import { init } from './init';
import { plan } from './plan';

async function run() {
  const request = "애플에서 맥북 주문해줘."
  const actions = await init(request);
  const link = actions[0].link!;
  let driver = await new Builder()
    .forBrowser(Browser.FIREFOX)
    .setFirefoxOptions(new firefox.Options().addArguments('--headless'))
    .build();

  try {
    await driver.get(link);
    
    let cnt = 1;
    let prompt = `goal: ${request}. 
    done_steps:
    1. 사이트에 접속 함.`

    while (cnt < 5) {
      await driver.sleep(3000);
      console.log("CNT", prompt);
      await driver.executeScript(`
        document.querySelectorAll('script').forEach((a) => a.remove());
        document.querySelectorAll('style').forEach((a) => a.remove());
        document.querySelectorAll('nav').forEach((a) => a.remove());
        document.querySelectorAll('aside').forEach((a) => a.remove());
        document.querySelectorAll('meta').forEach((a) => a.remove());
        return;
      `)
      const res = await driver.getPageSource();
    
      fs.writeFileSync('index.html', res);
      const ex = await plan(prompt);
      if (ex.type === 'GoTo') {
        await driver.get(ex.link!);
        prompt += `\n${cnt}. ${ex.link}로 이동함.`
      } else if (ex.type === 'Click') {
        async function findElement() {
          const target = ex.element;
          if (!target)  {
            console.log("NO ELEMENT", ex);
            return;
          }
          if (target.startsWith('xpath')) {
            return await driver.findElement({ xpath: target.replace('xpath:', '') });
          } else if (target.startsWith('id')) {
            return await driver.findElement({ id: target.replace('id:', '') });
          } else if (target.startsWith('class')) {
            return await driver.findElement({ className: target.replace('class:', '') });
          } else {
            console.log("UNKNOWN ELEMENT", target)
          }
        }

        const elem = await findElement();
        if (elem)  {
          await elem.click();
          prompt += `\n${cnt}. ${elem} 클릭함.`
        }
      }
      cnt++;
    }
  } catch (e) {
    console.log("ERROR", e);
  } finally {
    await driver.quit();
  }
}

run();