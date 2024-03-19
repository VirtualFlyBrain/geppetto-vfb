import sys
from lxml import etree

def parse_xmi(file_path):
    with open(file_path, 'rb') as file:
        tree = etree.parse(file)
        root = tree.getroot()
    namespaces = {
        'xmi': 'http://www.omg.org/XMI', 
        'ecore': 'http://www.eclipse.org/emf/2002/Ecore',
        'xsi': 'http://www.w3.org/2001/XMLSchema-instance'  # Adding the 'xsi' namespace
    }
    return root, namespaces

def list_queries_under_data_sources(root, namespaces):
    data_sources = root.findall('.//dataSources', namespaces=namespaces)
    all_data_sources_with_queries = []
    
    for i, ds in enumerate(data_sources):
        data_source_info = {'index': i, 'name': ds.get('name'), 'queries': []}
        queries = ds.findall('.//queries', namespaces=namespaces)
        for qi, query in enumerate(queries):
            query_info = {'index': qi, 'name': query.get('name')}
            data_source_info['queries'].append(query_info)
        all_data_sources_with_queries.append(data_source_info)
    
    return all_data_sources_with_queries

def corrected_debug_list_high_level_queries_with_indices(root, namespaces):
    high_level_queries = root.findall(".//*[@xsi:type='gep_2:CompoundRefQuery']", namespaces=namespaces)
    corrected_queries_info = []

    for query in high_level_queries:
        query_info = {'queryName': query.get('name'), 'queryChainRefs': []}
        query_chain_refs = query.get('queryChain', '').split()
        for ref in query_chain_refs:
            ref = ref.replace('//', '').replace('@', '')
            parts = ref.split('/')
            if len(parts) >= 2:
                dataSource, dataSourceIndex = parts[0].split('.')
                query, queryIndex = parts[1].split('.')
                query_info['queryChainRefs'].append({
                    'dataSourceIndex': dataSourceIndex,
                    'queryIndex': queryIndex
                })
        corrected_queries_info.append(query_info)
    return corrected_queries_info

def create_markdown_with_named_query_chains(high_level_queries, data_sources_with_queries):
    markdown_content = "# High-Level Queries with Named Query Chain Steps\n\n"
    for query in high_level_queries:
        query_id = query.get('id', 'No ID')  # Fallback to 'No ID' if not present
        query_description = query.get('description', 'No description provided')  # Fallback to default description
        markdown_content += f"## {query_id}: {query_description}\n"  # Using ID and description
        
        for chain_ref in query['queryChainRefs']:
            ds_index = int(chain_ref['dataSourceIndex'])
            q_index = int(chain_ref['queryIndex'])
            # Extract the name of the step for readability in the markdown.
            step_name = [q['name'] for q in data_sources_with_queries[ds_index]['queries'] if int(q['index']) == q_index][0]
            markdown_content += f"- Step: {step_name} (DataSource Index: {ds_index}, Query Index: {q_index})\n"
        markdown_content += "\n"
    return markdown_content

def main(xmi_path, readme_path):
    root, namespaces = parse_xmi(xmi_path)
    data_sources_with_queries = list_queries_under_data_sources(root, namespaces)
    high_level_queries_info = corrected_debug_list_high_level_queries_with_indices(root, namespaces)
    markdown_content = create_markdown_with_named_query_chains(high_level_queries_info, data_sources_with_queries)
    
    with open(readme_path, 'w') as markdown_file:
        markdown_file.write(markdown_content)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python process_xmi.py <path to vfb.xmi> <output path for README.md>")
        sys.exit(1)
    xmi_path = sys.argv[1]
    readme_path = sys.argv[2]
    main(xmi_path, readme_path)
