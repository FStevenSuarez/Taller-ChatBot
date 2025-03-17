from flask import Flask, request, jsonify
from transformers import pipeline
from producto_dao import ProductoDAO

app = Flask(__name__)

# Cargar modelo de QA
#print("🚀 Iniciando carga de modelos...")

#qa_pipeline = pipeline("question-answering",model="mrm8488/bert-spanish-cased-finetuned-squad-es")

#qa_pipeline = pipeline("question-answering", model="mrm8488/electra-small-spanish-squad2")


qa_pipeline = pipeline("question-answering", model="distilbert-base-cased-distilled-squad",max_answer_length=50)


print("✅ Modelo de QA cargado.")

def obtener_contexto(product_id):
    """Obtiene la descripción del producto desde la base de datos."""
    producto = ProductoDAO.obtener_producto_por_id(product_id)
    return producto['description'] if producto else "Descripción no encontrada."

@app.route("/chat", methods=["POST"])
def chat():
    """Procesa la pregunta del usuario con el contexto del producto."""
    datos = request.get_json()
    pregunta = datos.get("pregunta", "")
    product_id = datos.get("product_id", None)
    print(datos)
    
    if not product_id:
        return jsonify({"error": "Falta el ID del producto."}), 400
    
    contexto = obtener_contexto(product_id)
    
    if contexto == "Descripción no encontrada.":
        return jsonify({"error": "No se encontró información sobre este producto."}), 404
    
    respuesta = qa_pipeline({"question": pregunta, "context": contexto})
    return jsonify({"respuesta": respuesta["answer"]})

if __name__ == "__main__":
    print("🚀 Chatbot Service iniciado en http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
