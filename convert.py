import pandas as pd
import json

# Read and clean the 35k sheet
df = pd.read_excel("Product List123.xlsx", skiprows=4).fillna("")

products = []
for idx, row in df.iterrows():
    item = str(row.get("ITEM", "")).split(".")[0].strip()
    desc = str(row.get("ITEM_DESC", "")).strip()
    case = str(row.get("CASE", "")).strip()
    dept = str(row.get("DEPT._NAME", "")).strip()
    sup = str(row.get("PRIMARY_SUPPLIER_NAME", "")).strip()

    if item:
        products.append({
            "id": item,
            "desc": desc,
            "case": case,
            "dept": dept,
            "sup": sup
        })

# Save directly into your app directory
with open("products.json", "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False)

print("✅ Your fast database products.json is ready!")