import docx
from simplify_docx import simplify
import json

# Remplace par le chemin vers ton fichier .docx
docx_file_path = "./input.docx"

# Lecture du document
my_doc = docx.Document(docx_file_path)

# Conversion en JSON avec les options par défaut
my_doc_as_json = simplify(my_doc)

# Si tu veux utiliser des options non-standard
# my_doc_as_json = simplify(my_doc, {"remove-leading-white-space": False})

# Convertir en format JSON lisible
json_output = json.dumps(my_doc_as_json, indent=4)

# Sauvegarder le JSON dans un fichier
with open("output.json", "w", encoding="utf-8") as f:
    f.write(json_output)

print("Le fichier .docx a été converti avec succès en JSON.")
