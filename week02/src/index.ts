import { request } from "./request";

async function main() {
  const testSets = [
    "Please develop and serve a webpage that displays hello world.",
    "Please develop and serve a webpage that allows me to move a box with my mouse.",
    "Develop and serve a webpage that shows the total number of page views. Make sure to store this value because we need to show the total number of views when a new person joins.",
    "Please develop and serve a simple todo webpage. The user should be able to add and delete todo and see all todos. Develop in a neumorphism style.",
  ]
  for (const testSet of testSets) {
    const result = await request(testSet);
    console.log("Question: \n" + testSet + "\n\n");
    
    console.log("Answer: \n" + result);
    console.log("====================================")
  }
}

main();