from docs import build_docs
from openai_client import attach_embedding
from query import ask
from weaviate_client import insert

if __name__ == '__main__':

  docs = build_docs("https://lilianweng.github.io/posts/2023-06-23-agent/#component-one-planning")
  insert(docs)

  questions = [
    '플래닝과 리액팅을 어떻게 해야 하는지 설명해줘.',
    'MIPS, ChemCrow, Locality-Sensitive Hashing 각각이 뭐야?',
    "에이전트가 문제를 풀기 위해서 쪼개고 효과적으로 핸들링하는 과정을 20줄 이하로 임팩트있게 요약해줘.",
  ]

  for question in questions:
    answer = ask(question)

    print(f'Q: {question}\n\n A: {answer}\n\n\n')
