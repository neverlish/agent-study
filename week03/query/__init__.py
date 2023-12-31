from constants import EMBEDDING_MODEL, GPT_MODEL
from openai_client import oai
from token_util import num_tokens
from weaviate_client import client


def strings_ranked_by_relatedness(
    query: str,
    top_n: int = 100
) -> list[str]:
    """Returns a list of strings and relatednesses, sorted from most related to least."""
    articles = client.query.get("Article", ["title",  "body", "url"])\
        .with_generate(grouped_task=query)\
        .with_ask({"question": query})\
        .with_limit(top_n)\
        .do()
    rows = articles['data']['Get']['Article']
    return [i['body']  for i in rows]

def query_message(
    query: str,
    model: str,
    token_budget: int
) -> str:
    """Return a message for GPT, with relevant source texts pulled from a dataframe."""
    strings = strings_ranked_by_relatedness(query)
    introduction = 'Use the below articles to answer the subsequent question. If the answer cannot be found in the articles, write "I could not find an answer."'
    question = f"\n\nQuestion: {query}"
    message = introduction
    for string in strings:
        next_article = f'\n\section:\n"""\n{string}\n"""'
        if (
            num_tokens(message + next_article + question, model=model)
            > token_budget
        ):
            break
        else:
            message += next_article
    return message + question


def ask(
    query: str,
    model: str = GPT_MODEL,
    token_budget: int = 4096 - 500,
) -> str:
    """Answers a query using GPT and a dataframe of relevant texts and embeddings."""
    message = query_message(query, model=model, token_budget=token_budget)
    messages = [
        {"role": "system", "content": "You answer questions about the below articles."},
        {"role": "user", "content": message},
    ]
    response = oai.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0
    )
    response_message = response.choices[0].message.content
    return response_message