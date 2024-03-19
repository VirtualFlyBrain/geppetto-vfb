import sys
import html
from lxml import etree

def parse_xmi(file_path):
    with open(file_path, 'rb') as file:
        tree = etree.parse(file)
        root = tree.getroot()
    return root

def process_child_queries(query_element, indent, ds_id, ds_name, ds_url, namespaces, parent_query_entry):
    for child_query in query_element.findall('.//queries', namespaces=namespaces):
        query_id = child_query.get('id')
        query_name = child_query.get('name')
        query_description = child_query.get('description', '')
        query_type = child_query.get('{http://www.w3.org/2001/XMLSchema-instance}type')
        query_processor_id = child_query.get('queryProcessorId', 'Not provided')
        query_string_encoded = child_query.get('query', '')
        query_string_decoded = html.unescape(query_string_encoded)

        query_content = query_processor_id if query_type == "gep_2:ProcessQuery" else query_string_decoded

        child_query_entry = {
            'indent': indent + "    ",
            'dataSourceID': ds_id,
            'dataSourceName': ds_name,
            'dataSourceURL': ds_url,
            'queryID': query_id,
            'queryName': query_name,
            'queryDescription': query_description,
            'queryType': query_type,
            'query': query_content
        }

        parent_query_entry['childQueries'].append(child_query_entry)

        if query_type == "gep_2:CompoundQuery":
            child_query_entry['childQueries'] = []
            process_child_queries(child_query, indent + "    ", ds_id, ds_name, ds_url, namespaces, child_query_entry)

def process_queries(element, indent, ds_id, ds_name, ds_url, queries_info, namespaces):
    for query in element.findall('.//queries', namespaces=namespaces):
        query_id = query.get('id')
        query_name = query.get('name')
        query_description = query.get('description', '')
        query_type = query.get('{http://www.w3.org/2001/XMLSchema-instance}type')
        query_processor_id = query.get('queryProcessorId', 'Not provided')
        query_string_encoded = query.get('query', '')
        query_string_decoded = html.unescape(query_string_encoded)

        query_content = "Processor ID: " + query_processor_id if query_type == "gep_2:ProcessQuery" else query_string_decoded

        query_entry = {
            'indent': indent,
            'dataSourceID': ds_id,
            'dataSourceName': ds_name,
            'dataSourceURL': ds_url,
            'queryID': query_id,
            'queryName': query_name,
            'queryDescription': query_description,
            'queryType': query_type,
            'query': query_content,
            'childQueries': []
        }

        queries_info.append(query_entry)

        if query_type == "gep_2:CompoundQuery":
            process_child_queries(query, indent, ds_id, ds_name, ds_url, namespaces, query_entry)

def generate_markdown_for_all_queries(queries_info):
    markdown_content = "# Queries and Chains Across Data Sources\n\n"
    for info in queries_info:
        markdown_content += f"{info['indent']}## {info['queryName']}\n"
        markdown_content += f"{info['indent']}*DataSource*: {info['dataSourceName']} (ID: {info['dataSourceID']})\n"
        markdown_content += f"{info['indent']}*Description*: {info['queryDescription']}\n"
        markdown_content += f"{info['indent']}*Query Type*: {info['queryType']}\n"
        markdown_content += f"{info['indent']}*Query*: ```\n{info['query']}\n```\n\n"

        for child_query in info['childQueries']:
            markdown_content += f"{child_query['indent']}### {child_query['queryName']}\n"
            markdown_content += f"{child_query['indent']}*Description*: {child_query['queryDescription']}\n"
            markdown_content += f"{child_query['indent']}*Query*: ```\n{child_query['query']}\n```\n\n"

    return markdown_content

def save_to_file(content, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def main(xmi_file_path, output_markdown_path):
    namespaces = {'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
    root = parse_xmi(xmi_file_path)
    queries_info = []
    process_queries(root, "", None, None, None, queries_info, namespaces)
    markdown_content = generate_markdown_for_all_queries(queries_info)
    save_to_file(markdown_content, output_markdown_path)

if __name__ == "__main__":
    xmi_file_path = sys.argv[1]  # ecore xmi file
    output_markdown_path = sys.argv[2]  # Where the markdown file will be saved
    main(xmi_file_path, output_markdown_path)
