

import { randomUUID } from "crypto";
import * as fs from 'fs';
import { ChatCompletionMessageParam } from "openai/resources";
import { openai } from "../openai";
import { runCommand } from "../terminal";

async function direction(dir: string, userInput: string) {

  const messages: Array<ChatCompletionMessageParam> = [
    {
      role: "system",
      content: `As a senior developer, You should develop a web page.`
    },
    {
      role: "user",
      content: `
      
      Your task should be done in directory ${dir}.
    
      You should
      - only use html, css, javascript
      - you don't use any framework or library
      - If you need to implement save and load, you can use localStorage.
      - If you designated style, use css.
      - achieve the task as much as possible.
      
      Your job is to implement the following feature:
      - ${userInput}
      
      You generate  and process the task by conditions below.
      - Put the file in ${dir} directory.
      - You can use any html tags.
      - You must achieve the task as much as possible.
      - You divide the task into 3 files: html, css, javascript. Each task in each file.
      
      You respond in json format. The format is as follows:

      {
        "html": {
          "filename": "index.html",
          "code": "html CODE GOES HERE"
        },
        "css": {
          "filename": "index.css",
          "code": "css CODE GOES HERE"
        },
        "javascript": {
          "filename": "index.js",
          "code": "javascript CODE GOES HERE"
        }
      }
      `
    }
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
  })
  const {message} = response.choices[0];

  return JSON.parse(message.content!);
}

function prepare() {
  if (!fs.existsSync('made')) fs.mkdirSync('made');
  const dir = `made/${randomUUID()}`
  fs.mkdirSync(dir);
  return dir
}

export async function request(userInput: string) {
  const dir = prepare();
  const directed = await direction(dir, userInput);
  
  for (const v of Object.values(directed)) {
    const { filename, code } = v as any;
    
    await runCommand(`
    make cli command for creating new file and apply code to file, as follows:
    
    - filename: ${dir}/${filename}
    - code: ${code}
    
    `);
  }
  return `open ${dir}/${directed.html.filename}`
}