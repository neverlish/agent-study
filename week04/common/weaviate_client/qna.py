from .client import client
from common.constants import WEAVIATE_CLASS_NAME
from common.wikipedia import wiki_search

answers = {
    
}

def qna(arg):
    keyword = arg['keyword']
    query = f"What is {keyword}?"
    result = (
        client.query
            .get(WEAVIATE_CLASS_NAME, ["keyword", "contents"])
            .with_ask({
                "question": query,
            })
            .with_limit(1)
            .do()
    )
    # Check for errors
    if ("errors" in result):
        print ("\033[91mYou probably have run out of OpenAI API calls for the current minute – the limit is set at 60 per minute.")
        raise Exception(result["errors"][0]['message'])

    
    answer = ('\n'.join(result["data"]["Get"][WEAVIATE_CLASS_NAME][0]['contents']))
    if (keyword in answers and answer in answers[keyword]):
        return wiki_search({'keyword': keyword})
    else:
        if (keyword not in answers):
            answers[keyword] = []
        answers[keyword].append(answer)
    if (answer.strip() == ""):
        return wiki_search({'keyword': keyword})
    return (answer, answer)