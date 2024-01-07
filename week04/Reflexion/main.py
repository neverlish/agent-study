from .query import ask
import random
from common.docs import build_docs
from common.weaviate_client import insert, prepare
import time

def main():
  print("START")
  facts, questions = build_docs()
  # prepare()
  # insert(facts)
  questions_chosen = random.sample(questions, 10)
  for question in questions_chosen:
    time.sleep(2)
    answer = ask(question)

    print(f'Q: {question}\nA: {answer}\n\n\n')


if __name__ == '__main__':
  main() 