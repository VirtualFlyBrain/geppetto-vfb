import sys
import html
from lxml import etree

def parse_xmi(file_path):
    with open(file_path, 'rb') as file:
        tree = etree.parse(file)
        root = tree.getroot()
    return root

def process_queries(element, depth, queries_info, namespaces):
    for query in element.findall('.//queries', namespaces=namespaces):
        query_id = query.get('id')
        query_name = query.get('name')
        query_description = query.get('description', 'No description provided')
        query_type = query.get('{http://www.w3.org/2001/XMLSchema-instance}type')
        
        # Initialize query entry
        query_entry = {
            'depth': depth,
            'id': query_id,
            'name': query_name,
            'description': query_description,
            'type': query_type,
            'query': '',
            'childQueries': []
        }

        if query_type == "gep_2:CompoundQuery":
            # Process each queryChain within the compound query
            for query_chain in query.findall('.//queryChain', namespaces=namespaces):
                process_query_chain(query_chain, depth + 1, query_entry['childQueries'], namespaces)
        else:
            # Simple or process queries directly within <queries> tag
            query_content = query.get('query', query.get('queryProcessorId', 'No query provided'))
            query_entry['query'] = html.unescape(query_content)
        
        queries_info.append(query_entry)

def process_query_chain(query_chain, depth, child_queries_info, namespaces):
    chain_id = query_chain.get('id')
    chain_name = query_chain.get('name')
    chain_description = query_chain.get('description', 'No description provided')
    chain_type = query_chain.get('{http://www.w3.org/2001/XMLSchema-instance}type')
    chain_query = query_chain.get('query', query_chain.get('queryProcessorId', 'No query provided'))
    
    child_queries_info.append({
        'depth': depth,
        'id': chain_id,
        'name': chain_name,
        'description': chain_description,
        'type': chain_type,
        'query': html.unescape(chain_query)
    })

def generate_markdown_for_all_queries(queries_info):
    markdown_content = "# Queries and Chains Across Data Sources\n\n"
    for info in queries_info:
        markdown_content += generate_markdown_for_query(info)
    return markdown_content

def generate_markdown_for_query(info):
    # Calculate header level based on depth (depth 0 = ##, depth 1 = ###, etc.)
    header_level = '#' * (2 + info['depth'])
    
    markdown = f"{header_level} Query Name: {info['name']}\n"
    markdown += f"\n**ID:** {info['id']}\n\n"
    markdown += f"**Description:** {info['description']}\n\n"
    markdown += f"**Type:** {info['type']}\n\n"
    
    # Determine language for code block
    if '"statement":' in info['query']:
        lang = 'cypher'
    elif '"params":' in info['query']:
        lang = 'json'
    else:
        lang = 'java'
    
    if info['query'].strip():
        markdown += f"**Query:**\n\n```{lang}\n{info['query']}\n```\n\n"
    
    for child_query in info.get('childQueries', []):
        markdown += generate_markdown_for_query(child_query)
    
    return markdown

def main(xmi_file_path, output_markdown_path):
    namespaces = {'xsi': 'http://www.w3.org/2001/XMLSchema-instance'}
    root = parse_xmi(xmi_file_path)
    queries_info = []
    process_queries(root, 0, queries_info, namespaces)
    markdown_content = generate_markdown_for_all_queries(queries_info)
    with open(output_markdown_path, 'w', encoding='utf-8') as file:
        file.write(markdown_content)

if __name__ == "__main__":
    xmi_file_path = sys.argv[1]  # ecore xmi file
    output_markdown_path = sys.argv[2]  # Where the markdown file will be saved
    main(xmi_file_path, output_markdown_path)
