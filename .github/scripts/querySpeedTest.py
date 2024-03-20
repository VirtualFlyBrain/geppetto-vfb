import json
import time
from lxml import etree
import html
import nbformat as nbf
from nbformat.v4 import new_notebook, new_markdown_cell, new_code_cell

def parse_xmi(file_path):
    with open(file_path, 'rb') as file:
        tree = etree.parse(file)
        root = tree.getroot()
    return root, {'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}

def extract_queries_and_data_source(root, namespaces):
    queries_info = []
    for data_source in root.findall('.//dataSources', namespaces=namespaces):
        ds_url = data_source.get('url', '')
        ds_type = data_source.get('dataSourceService', '')
        query_elements = data_source.findall('.//queryChain', namespaces=namespaces)
        query_elements.extend(data_source.findall('.//queries', namespaces=namespaces))
        for query in query_elements:
            query_name = query.get('name')
            query_desc = query.get('description')
            query_content = query.get('query')
            query_content_decoded = html.unescape(query_content) if query_content else None
            queries_info.append({
                'name': query_name,
                'description': query_desc,
                'query': query_content_decoded,
                'data_source_url': ds_url,
                'data_source_type': ds_type
            })
    return queries_info

def create_notebook(queries_info, notebook_file_path):
    nb = new_notebook()
    nb.cells.append(new_markdown_cell("# Query Execution Notebook"))

    for query in queries_info:
        if query['query'] is None:
            continue

        md_content = f"## {query['name']}\nDescription: {query['description']}"
        nb.cells.append(new_markdown_cell(md_content))
        
        if query['data_source_type'] == 'neo4jDataSource':
            exec_code = generate_neo4j_code(query)
        elif query['data_source_type'].endswith('DataSource'):
            exec_code = generate_get_request_code(query)
        else:
            exec_code = "# Unknown data source type"

        nb.cells.append(new_code_cell(exec_code))
    
    with open(notebook_file_path, 'w', encoding='utf-8') as f:
        nbf.write(nb, f)

def generate_neo4j_code(query):
    return f"""
# Insert test IDs here
id = 'YOUR_TEST_ID'
ids = ['ID1', 'ID2']

# Query
query = {"{" + query['query'].replace("$ID", "id").replace("$ARRAY_ID_RESULTS", "ids") + "}"}
query_template = {query}

# Execute the query (example for Neo4j)
import requests
import time

start_time = time.time()
response = requests.post("{query['data_source_url']}", json={{'statements': [query]}})
end_time = time.time()
print('Status Code:', response.status_code)
print('Response:', response.json())
print('Time taken:', end_time - start_time)
"""

def generate_get_request_code(query):
    encoded_query = html.escape(query['query']).replace("{", "{{").replace("}", "}}").replace("$ID", "{id}").replace("$ARRAY_ID_RESULTS", "{ids}")
    return f"""
# Query execution for Solr or Owlery
import requests
import time

id = 'YOUR_SINGLE_ID_HERE'  # Replace with an actual ID
ids = ['ID1', 'ID2']  # Replace with actual IDs
query_url = "{query['data_source_url']}?" + "{encoded_query}".format(id=id, ids=','.join(ids))

start_time = time.time()
response = requests.get(query_url)
end_time = time.time()
print('Status Code:', response.status_code)
print('Response:', response.text)
print('Time taken:', end_time - start_time)
"""

if __name__ == "__main__":
    xmi_path = sys.argv[1]  # ecore xmi file
    notebook_path = sys.argv[2]  # Where the markdown file will be saved
    root, namespaces = parse_xmi(xmi_path)
    queries_info = extract_queries_and_data_source(root, namespaces)
    create_notebook(queries_info, notebook_path)
