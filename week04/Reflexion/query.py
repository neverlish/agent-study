from common.constants import GPT_MODEL
from common.openai_client import oai
from common.command import run_command
from .prompt import REFLECT_INSTRUCTION

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
                {'role': 'system', 'content': REFLECT_INSTRUCTION},
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
        splitted = response_message.strip().split(": ")
        
        if (len(splitted) < 2):
            return response_message
        thought, action = splitted[-2:]
        action = (action[0].lower() + action[1:]).strip()
        
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
        elif action.startswith('could not find'):
            message += f"\nThought: {i}: {thought}\n"
        elif action.startswith('reflection'):
            message += f"\nReflection: {thought}\n Trial ends.\nDo Next trial from Thought 1:\n"
    return "Cannot find answer."
