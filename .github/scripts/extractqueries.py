import html
from lxml import etree

def parse_xmi(file_path):
    with open(file_path, 'rb') as file:
        tree = etree.parse(file)
        root = tree.getroot()
    return root

def extract_simple_queries_with_data_source(root):
    namespaces = {'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
    simple_queries_info = []
    
    # Iterate through dataSources to find associated SimpleQuery instances
    for data_source in root.findall('.//dataSources', namespaces):
        ds_url = data_source.get('url', 'No URL provided')
        # Find SimpleQuery instances within this dataSource
        for query in data_source.findall('.//queries[@xsi:type="gep_2:SimpleQuery"]', namespaces):
            query_id = query.get('id')
            query_string_encoded = query.get('queryString', '')
            # Decode HTML entities in the query string
            query_string_decoded = html.unescape(query_string_encoded)
            
            simple_queries_info.append({
                'id': query_id,
                'dataSourceURL': ds_url,
                'query': query_string_decoded
            })
    
    return simple_queries_info

def generate_markdown_for_queries(simple_queries_info):
    markdown_content = "# Simple Queries and Data Source URLs\n\n"
    for info in simple_queries_info:
        markdown_content += f"## Query ID: {info['id']}\n"
        markdown_content += f"- DataSource URL: {info['dataSourceURL']}\n"
        markdown_content += f"  Query: ```cypher\n{info['query']}\n```\n"
        # Assuming the query can be directly appended to the data source URL
        full_query_url = f"{info['dataSourceURL']}?query={html.escape(info['query'])}"
        markdown_content += f"  Runnable Query URL: {full_query_url}\n\n"
    return markdown_content

def save_to_file(content, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def main(xmi_file_path, output_markdown_path):
    root = parse_xmi(xmi_file_path)
    simple_queries_info = extract_simple_queries_with_data_source(root)
    markdown_content = generate_markdown_for_queries(simple_queries_info)
    save_to_file(markdown_content, output_markdown_path)

if __name__ == "__main__":
    xmi_file_path = "./model/vfb.xmi"  # Adjust as necessary
    output_markdown_path = "./model/query.md"  # The path where the markdown file will be saved
    main(xmi_file_path, output_markdown_path)
