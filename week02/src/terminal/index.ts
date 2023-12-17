


import { exec } from "child_process";
import { ChatCompletionMessageParam } from "openai/resources";
import { openai } from "../openai";

const availableFunctions: {[key: string]: any} = {
  "cli-runner": (command: string) => {
    exec(command);
  },
}

export async function runCommand(prompt: string) {
  const messages: Array<ChatCompletionMessageParam> = [
    {
      role: "system",
      content: `You are a linux terminal. You can use add File via cli. 
      You are a helpful assistant. Only use the functions you have been provided with.`,
    },
    {
      role: "user",
      content: prompt
    }
  ]
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    tools: [
      {
        type: 'function',
        function: {
          name: 'cli-runner',
          description: 'run cli command',
          parameters: {
            type: 'object',
            properties: {
              command: {
                type: 'string'
              }
            },
            required: ['command'],
          }, 
        }
      }
    ]
  })
  const {message} = response.choices[0];
  if (message.tool_calls) {
    
    for (const toolCall of message.tool_calls) {
      const functionToCall = availableFunctions[toolCall.function.name]
      const functionArgs = JSON.parse(toolCall.function.arguments.replace(/\n/g, ''));
      if (functionToCall) {
        await functionToCall(functionArgs.command);
      }
    }
  }
}