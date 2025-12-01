import os

source_path = r'e:\Tools\Written\temp_category_widget.ejs'
target_path = r'e:\Tools\Written\themes\wikitten\layout\widget\category.ejs'

with open(source_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """branch.articles.sort(function(post0, post1) {
                        return new Date(post0.date) - new Date(post1.date)
                    })"""

new_code = """branch.articles.sort(function(post0, post1) {
                        if (post0.order && post1.order) {
                            return post0.order - post1.order;
                        }
                        if (post0.order) return -1;
                        if (post1.order) return 1;
                        return new Date(post0.date) - new Date(post1.date)
                    })"""

if old_code in content:
    new_content = content.replace(old_code, new_code)
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated category.ejs")
else:
    print("Could not find the code block to replace.")
    # Print a snippet to help debug
    start_index = content.find("branch.articles.sort")
    if start_index != -1:
        print("Found similar code:")
        print(content[start_index:start_index+200])
