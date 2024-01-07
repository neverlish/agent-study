import asyncio

from .client import client

from common.constants import WEAVIATE_CLASS_NAME

def insert(facts):
    print("Importing Articles", len(facts))

    with client.batch as batch:
        for fact in facts:
            try:
                batch.add_data_object(fact, class_name=WEAVIATE_CLASS_NAME)
            except Exception as e:
                print("Error: ", e)

    print("Importing Articles complete")