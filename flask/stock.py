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


def get_report(db, stock: str):
    """ Get an AI generated report on a stock """

    report = db.reference(f"/agents/stock/{stock}/report").get()

    if report != None:
        return report
    
    return ""


def start_report(stock: str):
    """ Begin generating an AI report """
    requests.get(f"{REPORTS_FUNCTION}?stock={stock}")


def get_status(db, stock: str):
    """ Get the status of the ai generated report on a stock """

    task = db.reference(f"/agents/stock/{stock}/current_task").get()

    if task != None:
        return task

    status = db.reference(f"/agents/stock/{stock}/state").get()

    if status != None:
        return status
    
    return ""
