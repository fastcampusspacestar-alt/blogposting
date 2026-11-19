"""S&P500 total-return (KRW) monthly series + 5-year DCA helpers."""
import pandas as pd, numpy as np, os
DL = os.path.join(os.path.dirname(__file__), '..', 'dl')

def load_sp(wht=0.15):
    sp = pd.read_csv(os.path.join(DL, 'sp500.csv'), parse_dates=['Date']).set_index('Date')
    sp = sp[['SP500', 'Dividend']].copy()
    # append Oct/Nov 2026 (Shiller-style monthly avg approximations; Nov = 11/13 close)
    sp.loc[pd.Timestamp('2026-10-01')] = [7680.0, 0.0]
    sp.loc[pd.Timestamp('2026-11-01')] = [7561.67, 0.0]
    sp = sp.sort_index()
    # dividends missing after 2023-06 -> estimate from approximate trailing yields
    yld = {2023: 0.015, 2024: 0.0135, 2025: 0.0122, 2026: 0.0115}
    m = sp['Dividend'] <= 0
    sp.loc[m, 'Dividend'] = [sp.loc[d, 'SP500'] * yld[d.year] for d in sp.index[m]]
    r = (sp['SP500'] + sp['Dividend'] / 12 * (1 - wht)) / sp['SP500'].shift(1)
    sp['TR'] = r.fillna(1).cumprod()
    return sp

def load_fx():
    fx = pd.read_csv(os.path.join(DL, 'fx_monthly.csv'), parse_dates=['Date'])
    fx = fx[fx.Country == 'South Korea'].set_index('Date')['Exchange rate']
    fx.loc[pd.Timestamp('2026-11-01')] = 1362.0
    idx = pd.date_range('1960-01-01', '2026-11-01', freq='MS')
    s = pd.Series(np.nan, index=idx)
    # pre-1981 official/pegged rates (KRW per USD)
    for d in idx:
        if d < pd.Timestamp('1961-02-01'): s[d] = 65.0
        elif d < pd.Timestamp('1964-05-01'): s[d] = 130.0
        elif d < pd.Timestamp('1971-06-01'): s[d] = 270.0  # approx (255 -> 310 crawling)
        elif d < pd.Timestamp('1972-06-01'): s[d] = 370.0
        elif d < pd.Timestamp('1974-12-01'): s[d] = 400.0
        elif d < pd.Timestamp('1980-01-01'): s[d] = 484.0
    # 1980: 580 (Jan devaluation) -> ~660 (Dec), linear; 1981 Jan-Mar ~ 665-675
    for i, d in enumerate(pd.date_range('1980-01-01', '1980-12-01', freq='MS')):
        s[d] = 580 + (660 - 580) * i / 11
    s[pd.Timestamp('1981-01-01')] = 665; s[pd.Timestamp('1981-02-01')] = 670; s[pd.Timestamp('1981-03-01')] = 674
    s.update(fx)
    return s

def build(wht=0.15):
    sp = load_sp(wht); fx = load_fx()
    df = sp.join(fx.rename('FX'), how='inner')
    df['TRK'] = df['TR'] * df['FX']   # KRW-denominated total return index
    return df

def dca_multiple(df, start, end, months=60, col='TRK'):
    """Final value at `end` of investing 1 KRW total, spread equally over `months` months from `start`."""
    s = pd.Timestamp(start); e = pd.Timestamp(end)
    dates = pd.date_range(s, periods=months, freq='MS')
    dates = [d for d in dates if d <= e]
    v = df.loc[e, col]
    return sum(v / df.loc[d, col] for d in dates) / len(dates)

def lump_multiple(df, start, end, col='TRK'):
    return df.loc[pd.Timestamp(end), col] / df.loc[pd.Timestamp(start), col]
