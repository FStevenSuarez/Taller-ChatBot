from flask import Flask, request, jsonify
from producto_dao import ProductoDAO
import base64

app = Flask(__name__)

@app.route("/productos", methods=["GET"])
def obtener_productos():
    """Devuelve la lista de productos desde la base de datos."""
    try:
        productos = ProductoDAO.obtener_productos()
        if productos:
            # Convertir imágenes BLOB a Base64
            for producto in productos:
                if isinstance(producto["image"], bytes):
                    producto["image"] = base64.b64encode(producto["image"]).decode("utf-8")
            return jsonify({"productos": productos}), 200
        return jsonify({"mensaje": "No hay productos disponibles"}), 404
    except Exception as e:
        print(f"⚠️ Error en obtener_productos: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route("/productos/<int:producto_id>", methods=["GET"])
def obtener_producto(producto_id):
    """Obtiene un producto específico por ID."""
    try:
        producto = ProductoDAO.obtener_producto_por_id(producto_id)
        if producto:
            if isinstance(producto["image"], bytes):
                producto["image"] = base64.b64encode(producto["image"]).decode("utf-8")
            return jsonify({"producto": producto}), 200
        return jsonify({"mensaje": "Producto no encontrado"}), 404
    except Exception as e:
        print(f"⚠️ Error en obtener_producto: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route("/productos", methods=["POST"])
def agregar_producto():
    """Agrega un nuevo producto."""
    try:
        datos = request.get_json()
        
        nombre = datos.get("name")  # Corregido
        precio = datos.get("price")  # Corregido
        descripcion = datos.get("description")  # Se agregó para consistencia
        imagen_base64 = datos.get("image")
        
        print("🔍 Datos recibidos en el backend:", nombre, precio, descripcion)  # Depuración
        
        
        if not nombre or not isinstance(nombre, str):
            return jsonify({"error": "El campo 'name' es obligatorio y debe ser una cadena"}), 400
        if not precio or not isinstance(precio, (int, float)):
            return jsonify({"error": "El campo 'price' es obligatorio y debe ser un número"}), 400
        if not descripcion or not isinstance(descripcion, str):
            return jsonify({"error": "El campo 'description' es obligatorio y debe ser una cadena"}), 400
        if not imagen_base64 or not isinstance(imagen_base64, str):
            return jsonify({"error": "El campo 'image' es obligatorio y debe ser una cadena Base64"}), 400

        imagen_bytes = base64.b64decode(imagen_base64)  # Convertir Base64 a BLOB
        ProductoDAO.agregar_producto(nombre, precio, descripcion, imagen_bytes)
        return jsonify({"mensaje": "Producto agregado exitosamente"}), 201
    except Exception as e:
        print(f"⚠️ Error en agregar_producto: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

if __name__ == "__main__":
    print("🚀 Productos Service iniciado en http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=True)