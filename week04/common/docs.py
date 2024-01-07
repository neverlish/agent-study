import requests


def build_docs():
    resp = requests.get('http://curtis.ml.cmu.edu/datasets/hotpot/hotpot_dev_fullwiki_v1.json')
    loaded = resp.json()[0:100]
    questions = []
    facts = []
    for i in loaded:
        questions.append(i['question'])
        for c in i['context']:
            facts.append({
                'keyword': c[0],
                'contents': c[1]
            })
            
    return facts, questions
