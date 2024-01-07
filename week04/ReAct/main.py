from query import ask
import json
import random
import time

def pick_questions():
  with open('data/hotpot_test.json', 'r') as f:
    questions = [i['question'] for i in json.load(f)]
    questions_chosen = random.sample(questions, 10)
    return questions_chosen

if __name__ == '__main__':
  questions = pick_questions()
  for question in questions:
    time.sleep(2)
    answer = ask(question)

    print(f'Q: {question}\nA: {answer}\n\n\n')
