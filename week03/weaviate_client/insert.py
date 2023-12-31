from .client import client

from constants import WEAVIATE_CLASS_NAME

def insert(docs):
    print("Importing Articles")

    with client.batch as batch:
        for counter, article in enumerate(docs):
            properties = {
                "title": article["title"],
                "body": article["body"],
                "url": article["url"],
            }
            
            batch.add_data_object(properties, class_name=WEAVIATE_CLASS_NAME)

    print("Importing Articles complete")