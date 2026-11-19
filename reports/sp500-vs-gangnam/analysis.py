import sp_engine as e, pandas as pd, json
df = e.build()
# name, kind, buy month, buy price(만원), end month, end price(만원), note, confidence
cases = [
 ('반포주공1단지 32평','단지','1973-01-01',560,'2024-07-01',730000,'1973 분양가 560만 → 2024 시세 약 73억(재건축 입주권 성격)','중'),
 ('압구정 현대 30평형','단지','1976-06-01',865,'2025-11-01',607000,'1976 분양가 865만 → 현대3차 82㎡ 2025.11 실거래 60.7억','중'),
 ('압구정 현대 48평형','단지','1976-06-01',1416,'2026-08-01',800000,'1976 분양가 1,416만 → 현대1차 49평 2026.08 실거래 80억','중'),
 ('은마 34평 (84㎡)','단지','1978-09-01',2339,'2026-11-01',343000,'1978 분양가 2,339만 → 2026.11 실거래 34.3억','상'),
 ('은마 31평 (76㎡)','단지','1979-12-01',1800,'2026-10-01',315000,'1979.12 분양가 1,800만 → 2026.10 KB시세 31.5억','상'),
 ('은마 34평 (84㎡)','단지','1988-12-01',8000,'2026-11-01',343000,'1988.12 호가 7,500~8,500만 → 34.3억','중'),
 ('은마 31평 (76㎡)','단지','1997-11-01',27000,'2026-10-01',315000,'1997.11 외환위기 직전 2.7억(평형 추정) → 31.5억','하'),
 ('은마 31평 (76㎡)','단지','1998-10-01',18500,'2026-10-01',315000,'1998.10 외환위기 저점 1.85억 → 31.5억','하'),
 ('은마 31평 (76㎡)','단지','2002-06-01',39750,'2026-10-01',315000,'2002 시세 3.8~4.15억 → 31.5억','중'),
 ('은마 34평 (84㎡)','단지','2003-01-01',58500,'2026-11-01',343000,'2003.01 시세 5.85억 → 34.3억','중'),
 ('은마 34평 (84㎡)','단지','2006-11-01',130000,'2026-11-01',343000,'2006 고점 13억 → 34.3억','중'),
 ('은마 31평 (76㎡)','단지','2012-02-01',79000,'2026-10-01',315000,'2012.02 실거래 7.9억 → 31.5억','상'),
 ('은마 34평 (84㎡)','단지','2015-06-01',107000,'2026-11-01',343000,'2015 평균 10.7억 → 34.3억','중'),
 ('은마 34평 (84㎡)','단지','2018-09-01',205000,'2026-11-01',343000,'2018.09 실거래 20.5억 → 34.3억','상'),
 ('은마 34평 (84㎡)','단지','2021-11-01',282000,'2026-11-01',343000,'2021.11 고점 실거래 28.2억 → 34.3억','상'),
 ('KB 서울 아파트 지수','지수','1986-01-01',100,'2023-10-01',610,'KB 월간시계열 1986.01 대비 2023.10 6.1배','상'),
 ('KB 강남 11개구 지수','지수','1987-07-01',16.441,'2026-03-01',110.894,'KB(CEIC) 서울 남부 1987.07 저점 16.44 → 2026.03 110.89','중'),
 ('KB 강남구 지수','지수','2015-08-01',100,'2025-08-01',203.3,'KB 강남구 10년 +103.3% (2015.08→2025.08)','상'),
]
def months_between(a,b): return (pd.Timestamp(b).to_period('M')-pd.Timestamp(a).to_period('M')).n
rows=[]
for n,k,s,p0,en,p1,note,conf in cases:
    yrs = months_between(s,en)/12
    g = p1/p0
    lump = e.lump_multiple(df,s,en)
    m = min(60, months_between(s,en)+1)
    dca = e.dca_multiple(df,s,en,m)
    # dca 'after 22% CGT on gains' multiple: value after tax per 1 KRW invested
    dca_tax = 1 + (dca-1)*0.78
    r = {}
    for ry in (0,0.02,0.03):
        gt = g*(1+ry)**yrs     # price + net imputed rent reinvested
        r[ry] = gt
    rows.append(dict(name=n,kind=k,start=s[:7],end=en[:7],years=round(yrs,1),p0=p0,p1=p1,note=note,conf=conf,
        g=g, g_cagr=g**(1/yrs)-1, lump=lump, sp_cagr=lump**(1/yrs)-1, dca=dca, months=m,
        need=g/dca, need_lump=g/lump, need_tax=g/dca_tax,
        need_r2=r[0.02]/dca, need_r3=r[0.03]/dca, need_r2_tax=r[0.02]/dca_tax))
out=pd.DataFrame(rows)
pd.set_option('display.width',300)
show=out[['name','start','end','years','g','g_cagr','lump','sp_cagr','dca','need','need_lump','need_tax','need_r2','need_r3','need_r2_tax']].copy()
for c in ['g','lump','dca']: show[c]=show[c].round(1)
for c in ['g_cagr','sp_cagr']: show[c]=(show[c]*100).round(1)
for c in ['need','need_lump','need_tax','need_r2','need_r3','need_r2_tax']: show[c]=(show[c]*100).round(0)
print(show.to_string(index=False))
out.to_json('results.json',orient='records',force_ascii=False)
# FX decomposition and S&P annual series for charts
ann = df[df.index.month==1][['SP500','TR','FX','TRK']]
ann = pd.concat([ann, df.loc[[pd.Timestamp('2026-11-01')],['SP500','TR','FX','TRK']]])
ann.to_csv('sp_annual.csv')
print(ann.loc['1973':].iloc[::5])
