import html
from lxml import etree

def parse_xmi(file_path):
    with open(file_path, 'rb') as file:
        tree = etree.parse(file)
        root = tree.getroot()
    return root

def extract_all_queries(root, namespaces):
    queries_info = []

    # Process all data sources and their queries
    for data_source in root.findall('.//dataSources', namespaces=namespaces):
        ds_id = data_source.get('id')
        ds_name = data_source.get('name')
        ds_url = data_source.get('url', 'No URL provided')
        
        for query in data_source.findall('.//queryChain', namespaces=namespaces):
            query_id = query.get('id')
            query_name = query.get('name')
            query_description = query.get('description', '')
            query_string_encoded = query.get('query', '')  # Correct attribute name
            query_type = query.get('{http://www.w3.org/2001/XMLSchema-instance}type')
            
            # Decode HTML entities in the query string
            query_string_decoded = html.unescape(query_string_encoded)

            queries_info.append({
                'dataSourceID': ds_id,
                'dataSourceName': ds_name,
                'dataSourceURL': ds_url,
                'queryID': query_id,
                'queryName': query_name,
                'queryDescription': query_description,
                'queryType': query_type,
                'query': query_string_decoded
            })

    return queries_info

def generate_markdown_for_all_queries(queries_info):
    markdown_content = "# Queries Across Data Sources\n\n"
    for info in queries_info:
        markdown_content += f"## DataSource: {info['dataSourceName']} (ID: {info['dataSourceID']})\n"
        markdown_content += f"Query ID: {info['queryID']} - {info['queryName']}\n"
        markdown_content += f"Description: {info['queryDescription']}\n"
        markdown_content += f"Query Type: {info['queryType']}\n"
        markdown_content += f"Query: ```text\n{info['query']}\n```\n\n"

    return markdown_content

def save_to_file(content, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def main(xmi_file_path, output_markdown_path):
    namespaces = {'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
    root = parse_xmi(xmi_file_path)
    queries_info = extract_all_queries(root, namespaces)
    markdown_content = generate_markdown_for_all_queries(queries_info)
    save_to_file(markdown_content, output_markdown_path)

if __name__ == "__main__":
    xmi_file_path = "path/to/your/vfb.xmi"  # Adjust the path as necessary
    output_markdown_path = "path/to/your/queries.md"  # The path where the markdown file will be saved
    main(xmi_file_path, output_markdown_path)
