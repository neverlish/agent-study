import { ChatCompletionMessageParam } from "openai/resources";
import { openai } from "../openai";
import { functionDefinitions } from "./definitions";
import { availableFunctions } from "../agents";

export async function request(userInput: string) {
  const messages: Array<ChatCompletionMessageParam> = [
    {
      role: "system",
      content:
        "You are a helpful assistant. Only use the functions you have been provided with.",
    },
    {
      role: "user",
      content: userInput,
    }
  ];
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
    functions: functionDefinitions,
  });
  const { finish_reason, message } = response.choices[0];
 
  if (finish_reason === "function_call") {
    const functionName: string = message.function_call!.name;
    // @ts-ignore
    const functionToCall = availableFunctions[functionName];
    if (functionToCall) {
      const functionArgs = JSON.parse(message.function_call?.arguments!);
      const functionArgsArr = Object.values(functionArgs);
      const functionResponse = await functionToCall(...functionArgsArr);
      return functionResponse
    }
  }
  return "I don't know";
}