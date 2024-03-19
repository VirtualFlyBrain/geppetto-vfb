import sys
import html
from lxml import etree

def parse_xmi(file_path):
    with open(file_path, 'rb') as file:
        tree = etree.parse(file)
        root = tree.getroot()
    return root

def extract_queries_and_chains(root, namespaces):
    queries_info = []

    for data_source in root.findall('.//dataSources', namespaces=namespaces):
        ds_id = data_source.get('id')
        ds_name = data_source.get('name')
        ds_url = data_source.get('url', 'No URL provided')
        
        process_queries(data_source, "", ds_id, ds_name, ds_url, queries_info, namespaces)

    return queries_info

def process_queries(element, indent, ds_id, ds_name, ds_url, queries_info, namespaces, parent_query_type=None):
    for query in element.findall('.//queries', namespaces=namespaces):
        query_id = query.get('id')
        query_name = query.get('name')
        query_description = query.get('description', '')
        query_type = query.get('{http://www.w3.org/2001/XMLSchema-instance}type')
        query_processor_id = query.get('queryProcessorId', 'Not provided')
        query_string_encoded = query.get('query', '')  # Assume simple queries use 'query' attribute
        query_string_decoded = html.unescape(query_string_encoded)

        # Handle ProcessQuery type by using queryProcessorId
        if query_type == "gep_2:ProcessQuery":
            query_content = query_processor_id
        else:
            query_content = query_string_decoded

        # For CompoundQuery types, indent child queries
        if query_type == "gep_2:CompoundQuery":
            queries_info.append({
                'indent': indent,
                'dataSourceID': ds_id,
                'dataSourceName': ds_name,
                'dataSourceURL': ds_url,
                'queryID': query_id,
                'queryName': query_name,
                'queryDescription': query_description,
                'queryType': query_type,
                'query': 'Compound Query - See child steps'
            })
            # Recursively process child queries of a compound query
            process_queries(query, indent + "    ", ds_id, ds_name, ds_url, queries_info, namespaces, query_type)
        else:
            queries_info.append({
                'indent': indent,
                'dataSourceID': ds_id,
                'dataSourceName': ds_name,
                'dataSourceURL': ds_url,
                'queryID': query_id,
                'queryName': query_name,
                'queryDescription': query_description,
                'queryType': query_type,
                'query': query_content
            })

def generate_markdown_for_all_queries(queries_info):
    markdown_content = "# Queries and Chains Across Data Sources\n\n"
    for info in queries_info:
        markdown_content += f"{info['indent']}## DataSource: {info['dataSourceName']} (ID: {info['dataSourceID']})\n"
        markdown_content += f"{info['indent']}Query ID: {info['queryID']} - {info['queryName']}\n"
        markdown_content += f"{info['indent']}Description: {info['queryDescription']}\n"
        markdown_content += f"{info['indent']}Query Type: {info['queryType']}\n"
        markdown_content += f"{info['indent']}Query: ```text\n{info['indent']}{info['query']}\n{info['indent']}```\n\n"

    return markdown_content

def save_to_file(content, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def main(xmi_file_path, output_markdown_path):
    namespaces = {'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
    root = parse_xmi(xmi_file_path)
    queries_info = extract_queries_and_chains(root, namespaces)
    markdown_content = generate_markdown_for_all_queries(queries_info)
    save_to_file(markdown_content, output_markdown_path)

if __name__ == "__main__":
    xmi_file_path = sys.argv[1]  # ecore xmi file
    output_markdown_path = sys.argv[2]  # Where the markdown file will be saved
    main(xmi_file_path, output_markdown_path)
