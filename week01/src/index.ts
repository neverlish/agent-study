import { request } from "./request";

async function main() {
  const testSets = [
    "파이썬 디자인 패턴에 관심있는데 읽을 만한 블로그 링크 줘.",
    "안다르의 “울라이크 스트레치 와이드 슬랙스” 상품 가격이 얼마야?",
    "코르카의 프로덕트 ADCIO, Agent Village에 대해 각각 설명해줘.",
  ]

  for (const testSet of testSets) {
    const result = await request(testSet);
    console.log("Question: \n" + testSet + "\n\n");
    
    console.log("Answer: \n" + result);
    console.log("====================================")
  }
}

main();