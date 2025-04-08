import pandas as pd

people_data = [
    {'Person_Id': 1, 'Personal_Name': 'David', 'Family_Name': 'Cohen', 'Gender': 'M', 'Father_Id': 3, 'Mother_Id': 4, 'Spouse_Id': 2},
    {'Person_Id': 2, 'Personal_Name': 'Leah', 'Family_Name': 'Cohen', 'Gender': 'F', 'Father_Id': None, 'Mother_Id': None, 'Spouse_Id': None},
    {'Person_Id': 3, 'Personal_Name': 'Moshe', 'Family_Name': 'Cohen', 'Gender': 'M', 'Father_Id': None, 'Mother_Id': None, 'Spouse_Id': 4},
    {'Person_Id': 4, 'Personal_Name': 'Rivka', 'Family_Name': 'Cohen', 'Gender': 'F', 'Father_Id': None, 'Mother_Id': None, 'Spouse_Id': 3},
    {'Person_Id': 5, 'Personal_Name': 'Yael', 'Family_Name': 'Cohen', 'Gender': 'F', 'Father_Id': 1, 'Mother_Id': 2, 'Spouse_Id': None},
    {'Person_Id': 6, 'Personal_Name': 'Daniel', 'Family_Name': 'Cohen', 'Gender': 'M', 'Father_Id': 3, 'Mother_Id': 4, 'Spouse_Id': None},
]

people_df = pd.DataFrame(people_data)

relations = []

for _, person in people_df.iterrows():
    pid = person['Person_Id']

    # Father
    if pd.notna(person['Father_Id']):
        relations.append({'Person_Id': pid, 'Relative_Id': int(person['Father_Id']), 'Connection_Type': 'אב'})

    # Mother
    if pd.notna(person['Mother_Id']):
        relations.append({'Person_Id': pid, 'Relative_Id': int(person['Mother_Id']), 'Connection_Type': 'אם'})

    # Spouse
    if pd.notna(person['Spouse_Id']):
        spouse_id = int(person['Spouse_Id'])
        connection = 'בן זוג' if person['Gender'] == 'F' else 'בת זוג'
        relations.append({'Person_Id': pid, 'Relative_Id': spouse_id, 'Connection_Type': connection})

    # Children
    children = people_df[(people_df['Father_Id'] == pid) | (people_df['Mother_Id'] == pid)]
    for _, child in children.iterrows():
        connection = 'בן' if child['Gender'] == 'M' else 'בת'
        relations.append({'Person_Id': pid, 'Relative_Id': child['Person_Id'], 'Connection_Type': connection})

    # Siblings
    siblings = people_df[(people_df['Father_Id'] == person['Father_Id']) &
                         (people_df['Mother_Id'] == person['Mother_Id']) &
                         (people_df['Person_Id'] != pid)]
    for _, sibling in siblings.iterrows():
        connection = 'אח' if sibling['Gender'] == 'M' else 'אחות'
        relations.append({'Person_Id': pid, 'Relative_Id': sibling['Person_Id'], 'Connection_Type': connection})

family_tree_df = pd.DataFrame(relations)

#part 2
extra_spouse_relations = []

spouse_links = [r for r in relations if r['Connection_Type'] in ['בן זוג', 'בת זוג']]
for rel in spouse_links:
    already_exists = any(
        r['Person_Id'] == rel['Relative_Id'] and
        r['Relative_Id'] == rel['Person_Id'] and
        r['Connection_Type'] in ['בן זוג', 'בת זוג']
        for r in relations
    )
    if not already_exists:
        reverse_connection = 'בן זוג' if rel['Connection_Type'] == 'בת זוג' else 'בת זוג'
        new_relation = {
            'Person_Id': rel['Relative_Id'],
            'Relative_Id': rel['Person_Id'],
            'Connection_Type': reverse_connection
        }
        relations.append(new_relation)
        extra_spouse_relations.append(new_relation)

print("Family Tree Table:")
print(family_tree_df)
print("Added Reverse Spouse Relations (Part 2):")
print(pd.DataFrame(extra_spouse_relations))
