import requests

STOCKS_FUNCTION = "https://get-stocks-xqeobirwha-uc.a.run.app/"
REPORTS_FUNCTION = "https://get-report-xqeobirwha-uc.a.run.app/"

def get_stocks():
    """ Get information about all stock """

    return requests.get(STOCKS_FUNCTION).json()

def get_stock(stock: str):
    """ Gets information about a single stock"""

    res = requests.get(STOCKS_FUNCTION).json()

    for s in res:
        if s["short_name"] == stock:
            return s

    return {}

def get_report(stock: str):
    """ Get an AI generated report on a stock """

    url = f"{REPORTS_FUNCTION}?stock={stock}"
    return requests.get(url).json()
