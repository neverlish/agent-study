
/// 작성했으나 사용하지 않는 코드들

async function mergeScreenshot(driver: WebDriver) {
  const data = await driver.executeScript<{ windowHeight: number, clientHeight: number }>("return {windowHeight: window.innerHeight, clientHeight: document.body.clientHeight};");
  const screenshots: Buffer[] = [];
  const pages = Math.ceil(data.clientHeight / data.windowHeight);
  for (let i = 0; i < pages; i++) {
    const height = i * data.windowHeight;
    await driver.executeScript(`window.scrollTo(0, ${height});`);
    const encodedString = await driver.takeScreenshot();
    screenshots.push(Buffer.from(encodedString, 'base64'));
  }
  const mergedImage = await joinImages(screenshots);
  await mergedImage.toFile('merged.png');
  const file = fs.readFileSync('./merged.png').toString('base64');
  fs.unlinkSync('./merged.png');
  return file;
}


async function findElement(base64_image: string, keyword: string, dimensions: { height: number, width: number } ) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    max_tokens: 3000,
    messages: [
      {
        "role": "system",
        "content": `I will give you screenshot of page. 
        
        And in user prompt, I will give you those things.
        - Final goal.
        - List of done steps: Theses are the steps that user already did.
        - Screen shot of the page.
        - Dimensions of the screenshot in json format as following: { height: 10000, width: 1000 }.
        
        Your job is 
        - to find the html text element that can make progress to archive the goal, concerning done steps.
          - condition for the element is that it should be clickable.
        - give me html element name you found in the screenshot.
        - give me width and height of the element in the screenshot.
        - give me list of items that meets the condition.
        - if there are multiple elements, give me everything you found.

        IGNORE THOSE HTML ELEMENTS
        - carousel, slider, and other elements that are not clickable.

        You give me following items in json response
        - relative width of the element in the screenshot by ratio.
        - relative height of the element in the screenshot by ratio.
        - name of the element in the screenshot
        - reason why you choose the element.
        
        
        Give me response in json array format as follows: 

        [
          { "width_ratio": 0.3, "height_ratio": 0.25, "name": "BUY BUTTON 1", "reason": "REASON WHY I CHOSE THIS ELEMENT IS" },
          { "width_ratio": 0.5, "height_ratio": 0.55, "name": "BUY BUTTON 2", "reason": "REASON WHY I CHOSE THIS ELEMENT IS ..." },
        ]

        GIVE ME ITEMS AS MANY AS YOU FOUND.

        sort by best to worst by fitness to goal.
        
        GIVE RESPONSE IN JSON FORMAT, so I can use result via JSON.parse.`
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": `keyword: ${keyword}, dimensions: ${{ height: dimensions.height, width: dimensions.width }}.`
          },
          {
            "type": "image_url",
            "image_url": {
              "url": `data:image/jpeg;base64,${base64_image}`
            }
          }
        ]
      }
    ],
    // response_format: { type: 'json_object' }
  })
  const content = response.choices[0].message.content!.replace(/json\n/g, '').replace(/\n/g, '').replace(/```/g, '');
  try {
    return JSON.parse(content);
  } catch (e) {
    console.log("ERROR", e);
    console.log("RESPONSE", response.choices[0].message);
    return null;
  }
}


async function filterAnchors(keyword: string, anchors: Array<{text: string, href: string}>) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-0125-preview',
    max_tokens: 3000,
    messages: [
      {
        "role": "system",
        "content": `I will give you list of anchors in the page. 
        
        And in user prompt, I will give you those things.
        - Final goal.
        - List of done steps: Theses are the steps that user already did.
        - List of anchors in the page.
        - keyword to filter anchors.
        
        Your job is 
        - to filter anchors that contains the keyword.
        - give me list of anchors that contains the keyword.

        You give me following items in json response
        - text of the anchor
        - href of the anchor.
        
        Give me response in json array format as follows: 

        [
          { "text": "BUY BUTTON 1", "href": "https://www.apple.com/macbook-pro-16/" },
          { "text": "BUY BUTTON 2", "href": "https://www.apple.com/macbook-pro-16/" },
        ]

        GIVE ME ITEMS AS MANY AS YOU FOUND.
        
        GIVE RESPONSE IN JSON FORMAT, so I can use result via JSON.parse.`
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": `keyword: ${keyword}.`
          },
          {
            "type": "text",
            "text": `anchors: ${JSON.stringify(anchors)}.`
          }
        ]
      }
    ],
    // response_format: { type: 'json_object' }
  })
  const content = response.choices[0].message.content!.replace(/json\n/g, '').replace(/\n/g, '').replace(/```/g, '');
  try {
    return JSON.parse(content);
  } catch (e) {
    console.log("ERROR", e);
    console.log("RESPONSE", response.choices[0].message);
    return null;
  }
}

 // const shot = await mergeScreenshot(driver);
      // const filename = `${Date.now()}.png`;
      // fs.writeFileSync(filename, shot, 'base64');
      // const img = Buffer.from(shot, 'base64');
      
      // const dimensions = sizeOf(img) as { height: number, width: number };
      // const result = await grid(filename);
      // console.log("RESULT!!", result);


      // const elements = await findElement(shot, prompt, { height: dimensions.height, width: dimensions.width });
      // console.log("ELEM", elements);
      
      // if (elements) {
      //   for (const elem of elements) {
      //     const height = elem.height_ratio * dimensions.height;
      //     const width = elem.width_ratio * dimensions.width;  
      //     const e = await driver.executeScript<WebElement>(`return document.elementFromPoint(${height}, ${width})`);
      //     console.log("E", e, height, width, cnt, await e.getTagName(), await e.getText());
          
      //     await e.click();
      //     // const id = await e.getAttribute('id');
      //     // const id2 = await e.getId();
      //     // await driver.findElement(By.id(id)).click();
      //     // console.log("AFTER!!", await driver.getCurrentUrl(), id, id2)
      //   }
      //   // const height = elem.height_ratio * dimensions.height! ;
      //   // const width = elem.width_ratio * dimensions.width!;
      //   // const e = await driver.executeScript<WebElement>(`return document.elementFromPoint(${height}, ${width})`);
      //   // console.log("E", e, height, width, cnt, await driver.getCurrentUrl());
      //   // const clicked = await e.click();
      //   // prompt += `\n${cnt}. ${elem.name} 클릭함.`
      //   // cnt++;
      //   // break;
      //   cnt++;
      // } else {
      //   break;
      // }