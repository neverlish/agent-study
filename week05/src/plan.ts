import { openai } from "./client";
import fs from 'fs';
import { toJson } from "./util";


export async function plan(keyword: string) {
  const file = await openai.files.create({ purpose: 'assistants', file: fs.createReadStream('index.html') });
  const assistant = await openai.beta.assistants.create({
    model: 'gpt-4-0125-preview',
    instructions: `You are html analyzer. 
    I will give you html file. 
    Your job is to extract to-do action to achive goal: ${keyword} 
    You give me only one direction.
    Thought can reason about the current situation, and Action must be in those types: 
    1. GoTo[link] : give link to go.
    2. Click[condition] : give selector such as id, class, so i can click it.
    3. Input[condition, value] : give selector such as id, class, so i can input value.
    4. Finish

    IGNORE ALL OTHER INFORMATION.
    IGNORE YOUR PRE-EXISTING KNOWLEDGE.

    Give response in json format, and example is as following:
    {
      "type": "GoTo",
      "link": "https://www.apple.com/mac/"
    }

    {
      "type": "Input",
      "element": "Input element for search",
      "value": "Macbook Pro 16 inch"
    }

    {
      "type": "Click",
      "element": "Search button"
    }

    {
      "type": "GoTo",
      "link": "https://www.apple.com/mac/macbook-pro-16/"
    }

    {
      "type": "Click",
      "element": "id: btn_buy"  // this is example. you can give any selector such as id, class.
    }

    {
      "type": "Finish"
    }

    When you give selector, give it in actual html file you got, so i can use it to find element.
    
    I don't want any other information or detail instruction from you.
    GIVE reponse only in valid json format.
    GIVE RESPONSE IN JSON FORMAT, so I can use result via JSON.parse
    `,
    tools: [{type: "code_interpreter"}],
    file_ids: [file.id],
  })
  
  const { thread } = await prepareThread(assistant.id);
  await openai.beta.assistants.files.del(assistant.id, file.id);

  const messagesResponse = await openai.beta.threads.messages.list(thread.id);
  const todos: Array<{ type: string, link?: string, element?: string }> = []

  messagesResponse.data.forEach((a) => {
    if (a.role === 'assistant') {
      a.content.forEach((b) => {
        console.log("B", b);
        if (b.type === 'text') {         
          try {
            todos.push(toJson(b.text.value));
          } catch (e) {
            console.log("ERROR", e);
          }
        }
      })
    }
  })
  return todos[0];
}

async function prepareThread(assistantId: string) {
  const thread = await openai.beta.threads.create();
  const threadRun = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistantId,
    additional_instructions: `give response in valid json format.`
  });

  let run = await openai.beta.threads.runs.retrieve(thread.id, threadRun.id);
  while (run.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(thread.id, threadRun.id);
  }
  return {
    thread,
    run,
  };
}