import pandas as pd

pd.options.display.max_rows = 300


df = pd.read_csv('entire.csv')


df = df[[
    'date', 
    'iso_code', 
    'total_cases_per_million',
    'new_cases_per_million',
    'total_deaths_per_million',
    'new_deaths_per_million',
    'people_vaccinated_per_hundred',
    'people_fully_vaccinated_per_hundred',
    'gdp_per_capita'
    ]]

codes = df.iso_code.drop_duplicates().sort_values()
dates = df.date.drop_duplicates().sort_values()

new = pd.DataFrame(columns=codes)

for code in codes:
    this = df[df.iso_code==code]
    new[code] = [this.gdp_per_capita.iloc[0]]
    print(this.gdp_per_capita.iloc[0])

new.fillna(0).to_csv('gdp.csv')




'''
for each in [
        'people_vaccinated_per_hundred',
        'people_fully_vaccinated_per_hundred'
        ]:
    new = pd.DataFrame(columns=codes, index=dates)
    for code in codes:
        this = df[df.iso_code==code]
        content = list(this[each].dropna())
        zeros = len(dates) - len(content)
        column = ([0] * zeros) + content
        new[code] = column
    new.to_csv(each + '.csv')

for each in [
        'total_cases_per_million',
        'new_cases_per_million',
        'total_deaths_per_million',
        'new_deaths_per_million'
        ]:
    new = pd.DataFrame(columns=codes, index=dates)
    for code in codes:
        this = df[df.iso_code==code]
        content = list(this[each].dropna())
        zeros = len(dates) - len(content)
        column = ([0] * zeros) + [ i / 10000 for i in content]
        new[code] = column
    new.to_csv(each + '.csv')
'''



