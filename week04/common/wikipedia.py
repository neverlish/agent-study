from bs4 import BeautifulSoup

from requests.sessions import Session
from requests.adapters import HTTPAdapter

def request(url):
    with Session() as session:
        adapter = HTTPAdapter(max_retries=5)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        return session.request(method="get", url=url, timeout=10)


def wiki_search(args):
    keyword = args.get("keyword")
    search_url = f"https://en.wikipedia.org/w/index.php?search={keyword}"
    response_text = request(search_url).text
    soup = BeautifulSoup(response_text, features="html.parser")
    result_divs = soup.find_all("div", {"class": "mw-search-result-heading"})
    page = None
    if result_divs:  # mismatch
        result_titles = [div.get_text().strip() for div in result_divs]
        observation = f"Could not find {keyword}. Similar: {result_titles[:5]}."
    else:
        page = [p.get_text().strip() for p in soup.find_all("p") + soup.find_all("ul")]
        if any("may refer to:" in p for p in page):
            wiki_search("[" + keyword + "]")
        else:
            page = ' '.join(page[:5])
            observation = f"Observation: {page}"
    return (page, observation)