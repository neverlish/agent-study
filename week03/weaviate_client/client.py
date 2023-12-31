import os

import weaviate

from constants import WEAVIATE_CLASS_NAME

client = weaviate.Client(
    url = "http://localhost:8080",  # Replace with your endpoint
    additional_headers = {
        "X-OpenAI-Api-Key": os.environ["OPENAI_API_KEY"] # Replace with your inference API key
    }
)

class_obj = {
    "class": WEAVIATE_CLASS_NAME,
    "vectorizer": "text2vec-openai",  # If set to "none" you must always provide vectors yourself. Could be any other "text2vec-*" also.
    # "moduleConfig": {
    #     "text2vec-openai": {},
    #     "generative-openai": {}  # Ensure the `generative-openai` module is used for generative queries
    # }
    "moduleConfig": {
        "text2vec-openai": {
          "model": "ada",
          "modelVersion": "002",
          "type": "text"
        }, 
        "qna-openai": {
          "model": "text-davinci-002",
          "maxTokens": 16,
          "temperature": 0.0,
          "topP": 1,
          "frequencyPenalty": 0.0,
          "presencePenalty": 0.0
        },
        "generative-openai": {
          "model": "gpt-3.5-turbo"
        },
    },
    "properties": [
        {
            "dataType": [
                "text"
            ],
            "description": "Content that will be vectorized",
            "name": "body"
        }
    ]
}

client.schema.delete_all()

client.schema.create_class(class_obj)

client.batch.configure(
    batch_size=10, 
    dynamic=True,
    timeout_retries=3,
#   callback=None,
)