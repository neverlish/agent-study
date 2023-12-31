import requests
from bs4 import BeautifulSoup as BS
from .chunk import split_docs

def build_docs(url):

    resp = requests.get(url)
    soup = BS(resp.text, features="html.parser")
    
    title = soup.find("title").text
    body = soup.find("body").text
    anchors = [{"title": title, "url": url, "body": body}]
    for a in soup.findAll('a'):
        href = a.get("href")
        if href and href.startswith("http"):
            title = a.text.strip()
            if len(anchors) < 10:
                if title:
                    resp = requests.get(url)
                    soup = BS(resp.text, features="html.parser")
                    body = soup.find("body").text
                    anchors.append({"title":title, "url": href, "body": body})
    
    return split_docs(anchors)
