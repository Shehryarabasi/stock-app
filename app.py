import streamlit as st
import pandas as pd
import barcode
from barcode.writer import ImageWriter
from io import BytesIO
from PIL import Image

# 1. Config page settings
st.set_page_config(page_title="Product Directory App", layout="wide")

# 2. Safely read the local Excel sheet 
@st.cache_data
def load_excel_data():
    file_name = "Product List123.xlsx" 
    df = pd.read_excel(file_name, skiprows=4)
    df.columns = [str(col).strip() for col in df.columns]
    df = df.fillna("") 
    return df

try:
    product_df = load_excel_data()
    cols = list(product_df.columns)
    
    # DYNAMIC COLUMN MATCHING
    item_desc_col = next((c for c in cols if 'item' in c.lower() and 'desc' in c.lower()), 'ITEM_DESC')
    item_col = next((c for c in cols if 'item' in c.lower() and 'desc' not in c.lower()), 'ITEM')
    case_col = next((c for c in cols if 'case' in c.lower() or 'cas' in c.lower()), 'CASE')
    supplier_num_col = next((c for c in cols if 'supplier' in c.lower() and 'name' not in c.lower()), 'PRIMARY_SUPPLIER_')
    supplier_name_col = next((c for c in cols if 'supplier' in c.lower() and 'name' in c.lower()), 'PRIMARY_SUPPLIER_NAME')
    dept_num_col = next((c for c in cols if 'dept' in c.lower() and 'name' not in c.lower()), 'DEPT._')
    dept_name_col = next((c for c in cols if 'dept' in c.lower() and 'name' in c.lower()), 'DEPT._NAME')

    # Clean formatting
    for col_name in [supplier_num_col, dept_num_col, item_col]:
        if col_name in product_df.columns:
            product_df[col_name] = product_df[col_name].astype(str).apply(lambda x: x.split('.')[0] if '.' in x else x)

except Exception as err:
    st.error(f"Could not load the file: {err}")
    st.stop()

# --- APP LAYOUT ---
st.title("📦 Smart Stock & Supplier Directory")

# --- SIDEBAR SEARCH FILTERS ---
st.sidebar.header("🔍 Filter Directory")
search_input = st.sidebar.text_input("Search by Name, Code, or Dept...", "").strip().lower()

# Real-time filtering engine
if search_input:
    filtered_results = product_df[
        product_df[supplier_num_col].astype(str).str.lower().str.contains(search_input) |
        product_df[supplier_name_col].astype(str).str.lower().str.contains(search_input) |
        product_df[item_col].astype(str).str.lower().str.contains(search_input) |
        product_df[item_desc_col].astype(str).str.lower().str.contains(search_input) |
        product_df[dept_name_col].astype(str).str.lower().str.contains(search_input)
    ]
else:
    filtered_results = product_df

# --- MAIN INTERACTIVE SELECTION ---
if not filtered_results.empty:
    
    # We use Streamlit's new selection feature for tables!
    # Users can now directly click on a row in the table to load its details and barcode.
    if search_input:
        st.subheader(f"📋 Suggestions Found ({len(filtered_results)} matches)")
        st.info("💡 Click on any row in the table below to select that item instantly!")
        
        display_table = filtered_results[[item_col, item_desc_col, case_col, supplier_name_col, dept_name_col]].copy()
        display_table.columns = ["Item Code", "Item Description", "Case Size", "Supplier Name", "Department"]
        
        # Enable single-row selection
        event = st.dataframe(
            display_table, 
            use_container_width=True, 
            hide_index=True,
            on_select="rerun",
            selection_mode="single"
        )
        
        # Check if user clicked a row in the table
        selected_rows = event.get("selection", {}).get("rows", [])
        if selected_rows:
            selected_idx = selected_rows[0]
            selected_product = filtered_results.iloc[selected_idx]
        else:
            # Default to the first item if nothing is clicked yet
            selected_product = filtered_results.iloc[0]
    else:
        # If no search input, let them use a simple dropdown
        filtered_results['display_name'] = filtered_results[item_col].astype(str) + " - " + filtered_results[item_desc_col].astype(str)
        chosen_item = st.selectbox("👉 Choose an item to view details:", filtered_results['display_name'])
        selected_product = filtered_results[filtered_results['display_name'] == chosen_item].iloc[0]

    st.markdown("---")

    # --- BRAND NEW PRODUCT DETAILS VIEW ---
    # Prioritizing Barcode, Department Name/No, Supplier Name/No at the absolute top.
    
    top_left_col, top_right_col = st.columns([1, 1])
    
    with top_left_col:
        # 1. Barcode is presented immediately at the top right
        st.subheader("🏷️ Scannable Barcode")
        barcode_value = str(selected_product[item_col]).strip()
        if barcode_value.isalnum():
            try:
                bytes_buffer = BytesIO()
                code_type = barcode.get_genre('code128')
                code_type(barcode_value, writer=ImageWriter()).write(bytes_buffer)
                final_barcode_img = Image.open(bytes_buffer)
                st.image(final_barcode_img, caption=f"Code: {barcode_value}", width=380)
            except Exception:
                st.warning("Unable to generate barcode.")
    
    with top_right_col:
        # 2. Dept & Supplier Info grouped clearly at the top right
        st.subheader("📍 Quick Reference Info")
        st.markdown(f"""
        ### **Department**
        * **Name:** `{selected_product[dept_name_col]}`
        * **Number:** `{selected_product[dept_num_col]}`
        
        ### **Supplier**
        * **Name:** `{selected_product[supplier_name_col]}`
        * **Number:** `{selected_product[supplier_num_col]}`
        """)

    st.markdown("---")
    
    # 3. Rest of the product info displayed cleanly down below
    st.subheader("📦 Extended Item Specifications")
    spec_col1, spec_col2 = st.columns(2)
    with spec_col1:
        st.info(f"**Item Description:**\n### {selected_product[item_desc_col]}")
    with spec_col2:
        st.success(f"**Case Size (CAS):**\n### {selected_product[case_col]}")

else:
    st.warning("No matches found. Please re-type your search keyword or code.")