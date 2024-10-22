# This file aims to gather share information and update them
#   in real time. A default list has been specified.

import yfinance as yf
import threading
import time

tickers = [
    # Share Tickers
    "AAPL",      # Apple Inc.
    "MSFT",      # Microsoft Corporation
    "GOOGL",     # Alphabet Inc.
    "AMZN",      # Amazon.com, Inc.
    "TSLA",      # Tesla, Inc.
    "META",      # Meta Platforms, Inc. (Facebook)
    "NVDA",      # NVIDIA Corporation
    "BRK-B",     # Berkshire Hathaway Inc.
    "JNJ",       # Johnson & Johnson
    "V",         # Visa Inc.
    "WMT",       # Walmart Inc.
    "PG",        # Procter & Gamble Co.
    "JPM",       # JPMorgan Chase & Co.
    "DIS",       # The Walt Disney Company
    "HD",        # The Home Depot, Inc.
    "MA",        # Mastercard Incorporated
    "XOM",       # Exxon Mobil Corporation
    "NFLX",      # Netflix, Inc.
    "INTC",      # Intel Corporation
    "PYPL",      # PayPal Holdings, Inc.
    
    # Crypto Tickers
    "BTC-USD",   # Bitcoin
    "ETH-USD",   # Ethereum
    "BNB-USD",   # Binance Coin
    "ADA-USD",   # Cardano
    "SOL-USD",   # Solana
    "XRP-USD",   # Ripple (XRP)
    "DOT-USD",   # Polkadot
    "LTC-USD",   # Litecoin
    "DOGE-USD",  # Dogecoin
    "MATIC-USD"  # Polygon
]


# List of updated shares
_shares = {}
_share_information_subroutine: threading.Thread = None


# Stores information about a particular share
class Share():
    # Short Name e.g. BTC-USD
    # Long Name e.g. Bitcoin
    # Price in a specific currency
    def __init__(self, short_name: str, long_name: str, price: float, currency: str):
        self.short_name = short_name
        self.long_name = long_name
        self.price = price
        self.currency = currency


# Private subroutine to look up shares
def _research_shares(interval: int) -> None:
    while True:
        print("Looking up shares...")

        for ticker in tickers:
            print(f"Searching {ticker}...")
            stock = yf.Ticker(ticker)
            info = stock.info
            try:
                _shares[ticker] = (Share(ticker, info['longName'], info['currentPrice'], info['currency']))
            except KeyError:
                print("Cannot retrieve data, possibly ratelimited?")
                break

        time.sleep(interval)


# Get updated share information
def get_share_information() -> list[Share]:
    return _shares.copy()  # TODO: will this prevent two of the same shares
                           #   in different lists from keeping the same
                           #   updates?


# Begin share loading and updating
def begin_share_subroutine(interval: int) -> None:
    global _share_information_subroutine
    if _share_information_subroutine != None:
        return
    
    _share_information_subroutine = threading.Thread(target=_research_shares, args=(interval,))
    _share_information_subroutine.start()
