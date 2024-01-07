from common.constants import GPT_MODEL
from common.openai_client import oai
from common.command import run_command

webthink_examples = """\nQuestion: What is the elevation range for the area that the eastern sector of the Colorado orogeny extends into?\nThought 1: I need to search Colorado orogeny, find the area that the eastern sector of the Colorado orogeny extends into, then find the elevation range of the area.\nAction 1: Search[Colorado orogeny]\nObservation 1: The Colorado orogeny was an episode of mountain building (an orogeny) in Colorado and surrounding areas.\nThought 2: It does not mention the eastern sector. So I need to look up eastern sector.\nAction 2: Lookup[eastern sector]\nObservation 2: (Result 1 / 1) The eastern sector extends into the High Plains and is called the Central Plains orogeny.\nThought 3: The eastern sector of Colorado orogeny extends into the High Plains. So I need to search High Plains and find its elevation range.\nAction 3: Search[High Plains]\nObservation 3: High Plains refers to one of two distinct land regions:\nThought 4: I need to instead search High Plains (United States).\nAction 4: Search[High Plains (United States)]\nObservation 4: The High Plains are a subregion of the Great Plains. From east to west, the High Plains rise in elevation from around 1,800 to 7,000 ft (550 to 2,130 m).[3]\nThought 5: High Plains rise in elevation from around 1,800 to 7,000 ft, so the answer is 1,800 to 7,000 ft.\nAction 5: Finish[1,800 to 7,000 ft]"""

instruction = """
Solve a question answering task with interleaving Thought, Action, Observation steps.
You do in only one step per each request. 
Thought can reason about the current situation, and Action can be three types: 
(1) Search[entity], which searches the exact entity on Wikipedia and returns the first paragraph if it exists. If not, it will return some similar entities to search.
(2) Lookup[keyword], which returns the next sentence containing keyword in the current passage.
(3) Finish[answer], which returns the answer and finishes the task.
Here are some examples.
"""
webthink_prompt = instruction + webthink_examples

def ask(
    query: str,
    model: str = GPT_MODEL,
) -> str:
    """Answers a query using GPT and a dataframe of relevant texts and embeddings."""
    message = f"\n\nQuestion: {query}"
    page = None
    for i in range(1, 10):
        response = oai.chat.completions.create(
            model=model,
            messages=[
                {'role': 'system', 'content': webthink_prompt},
                {'role': 'user', 'content': f"{message} Thought {i}:"}
            ],
            temperature=0,
            max_tokens=100,
            top_p=1,
            frequency_penalty=0.0,
            presence_penalty=0.0,
            stop=["\nObservation ${i}:"],
        )
        response_message = response.choices[0].message.content
        splitted = response_message.strip().split(f": ")
        # print("response_message", response)
        # print("\n=====================\n")
        if (len(splitted) < 2):
            return response_message
        thought, action = splitted[-2:]
        action = action[0].lower() + action[1:]
        
        if action.startswith('search'):
            keyword = action.split('[')[1].split(']')[0]
            paged, searched = run_command(f"search keyword {keyword}")
            page = paged
            message += f"\nThought: {i}: {thought}\nAction {i}: {action}\nObservation {i}: {searched}\n"
        elif action.startswith('lookup'):
            message += f"\nThought: {i}: {thought}\nAction {i}: {action}\nObservation {i}: {page}\n"
        elif action.startswith('finish'):
            answer =  response_message.split("Finish[")[1].replace("]", "")
            if (answer.strip() == ""):
                return response_message
            return answer
    return "Cannot find answer."
