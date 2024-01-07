import json

from common.weaviate_client import qna

from .constants import GPT_MODEL
from .openai_client import oai
from .wikipedia import wiki_search

functions = {
    "ask-doc": qna
}

def run_command(query):
    response = oai.chat.completions.create(
        model=GPT_MODEL,
        messages=[
            { 'role': "system", 'content': "You are a linux terminal. You can run commands." },
            { 'role': "user", 'content': query }
        ],
        
        tools=[
            {
                'type': 'function',
                'function': {
                    'name': 'ask-doc',
                    'description': 'search in documents',
                    'parameters': {
                        'type': 'object',
                        'properties': {
                        'keyword': {
                            'type': 'string'
                        }
                        },
                        'required': ['keyword'],
                    }
                }
            }
        ]
    )
    message = response.choices[0].message
    if (message.tool_calls):
        for call in message.tool_calls:
            functionToCall = functions[call.function.name]
            functionArgs = json.loads(call.function.arguments)
            return functionToCall(functionArgs)
    raise Exception("No tool call found")