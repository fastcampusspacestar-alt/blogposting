import sp_engine as e, pandas as pd, json
df=e.build()
res=json.load(open('results.json'))
# monthly series 1973-01.. normalized
s=df.loc['1973-01-01':]
series=[[d.strftime('%Y-%m'), round(r.TRK,2), round(r.TR,4), round(r.FX,1)] for d,r in s.iterrows()]
eunma=[('1978-09',2339,'분양가'),('1988-12',8000,'호가'),('2003-01',58500,'시세'),('2006-11',130000,'고점 시세'),('2010-08',104000,'시세'),('2015-06',107000,'평균 거래가'),('2018-09',205000,'실거래'),('2019-10',218000,'실거래'),('2021-11',282000,'실거래'),('2022-10',210000,'실거래'),('2024-08',285000,'실거래'),('2025-10',431000,'실거래 최고'),('2026-11',343000,'실거래')]
# peak-end sensitivity for 은마 34평 1978 & 2018 with end 2025-10 (43.1억)
sens=[]
for s0,p0 in [('1978-09-01',2339),('1988-12-01',8000),('2006-11-01',130000),('2018-09-01',205000)]:
    for en,p1 in [('2025-10-01',431000),('2026-11-01',343000)]:
        g=p1/p0; m=min(60,(pd.Timestamp(en).to_period('M')-pd.Timestamp(s0).to_period('M')).n+1)
        d=e.dca_multiple(df,s0,en,m); sens.append(dict(start=s0[:7],end=en[:7],g=g,dca=d,need=g/d))
for x in sens: print(x)
json.dump(dict(cases=res,series=series,eunma=eunma,sens=sens),open('data.json','w'),ensure_ascii=False)
print(len(series))
