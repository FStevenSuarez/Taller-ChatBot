import os
import requests
import base64
import questionary
from prettytable import PrettyTable
from textwrap import fill
from tkinter import Tk, filedialog
from PIL import Image

API_URL = "http://localhost:5000"

def limpiar_pantalla():
    """Limpia la pantalla de la terminal para mejorar la visualización."""
    os.system("cls" if os.name == "nt" else "clear")

def crear_producto():
    """Solicita datos al usuario y envía una petición para crear un nuevo producto."""
    limpiar_pantalla()
    print("CREAR NUEVO PRODUCTO\n")
    
    nombre = questionary.text("Ingrese el nombre del producto:").ask()
    precio = questionary.text("Ingrese el precio del producto:").ask()
    descripcion = questionary.text("Ingrese la descripción del producto:").ask()
    
    # Seleccionar imagen
    print("Seleccione una imagen para el producto...")
    Tk().withdraw()
    imagen_path = filedialog.askopenfilename(title="Seleccione una imagen", filetypes=[("Imágenes", "*.png;*.jpg;*.jpeg")])
    
    if not imagen_path:
        print("❌ No se seleccionó ninguna imagen. Operación cancelada.")
        input("Presione ENTER para volver al menú...")
        return
    
    with open(imagen_path, "rb") as img_file:
        imagen_base64 = base64.b64encode(img_file.read()).decode("utf-8")
    
    # Enviar solicitud al API
    response = requests.post(f"{API_URL}/productos", json={
        "name": nombre,
        "price": float(precio),
        "description": descripcion,
        "image": imagen_base64
    })
    
    if response.status_code == 201:
        print("✅ Producto creado exitosamente!")
    else:
        print("❌ Error al crear el producto.")
    
    input("Presione ENTER para volver al menú...")

def listar_productos():
    """Consulta y muestra una lista de productos con descripciones ajustadas a 50 caracteres."""
    limpiar_pantalla()
    print("LISTA DE PRODUCTOS\n")
    
    response = requests.get(f"{API_URL}/productos")
    if response.status_code == 200:
        productos = response.json().get("productos", [])
        if not productos:
            print("No hay productos disponibles.")
        else:
            tabla = PrettyTable(["ID", "Nombre", "Precio", "Descripción"])
            tabla.max_width["Nombre"] = 20
            tabla.max_width["Descripción"] = 30
            
            for p in productos:
                descripcion_corta = fill(p["description"], width=50)
                tabla.add_row([p["id"], p["name"], f"${p['price']}", descripcion_corta])
            print(tabla)
    else:
        print("❌ Error al obtener la lista de productos.")
    
    input("Presione ENTER para volver al menú...")

def consultar_chatbot():
    """Consulta el chatbot enviando una pregunta con el ID del producto y muestra la respuesta."""
    limpiar_pantalla()
    print("CONSULTAR CHATBOT\n")
    
    # Obtener la lista de productos
    response = requests.get(f"{API_URL}/productos")
    if response.status_code == 200:
        productos = response.json().get("productos", [])
        if not productos:
            print("No hay productos disponibles.")
            input("Presione ENTER para volver al menú...")
            return
    else:
        print("Error al obtener los productos.")
        input("Presione ENTER para volver al menú...")
        return
    
    # Mostrar lista de productos para selección
    opciones = [f"{p['id']} - {p['name']} - {fill(p['description'], width=50)}" for p in productos] + ["Volver"]
    seleccion = questionary.select("Seleccione un producto para hacer la consulta:", choices=opciones).ask()
    
    if seleccion == "Volver":
        return
    
    product_id = int(seleccion.split(" - ")[0])
    
    while True:
        pregunta = questionary.text("Ingrese su pregunta (o escriba 'salir' para volver al menú):").ask()
        if pregunta.lower() == "salir":
            break
        
        response = requests.post(f"{API_URL}/chatbot", json={"pregunta": pregunta, "product_id": product_id})
        if response.status_code == 200:
            print(f"\n🤖 Respuesta del chatbot: {response.json().get('respuesta', 'No se obtuvo respuesta')}")
        else:
            print("\n❌ Error al consultar el chatbot.")
    
    input("\nPresione ENTER para volver al menú...")

def menu():
    """Muestra un menú interactivo y permite navegar entre opciones."""
    while True:
        limpiar_pantalla()
        print("MENÚ PRINCIPAL\n")
        respuesta = questionary.select(
            "Seleccione una opción:",
            choices=["1 - Crear producto", "2 - Listar productos", "3 - Consultar chatbot", "4 - Salir"]
        ).ask()
        
        if respuesta.startswith("1"):
            crear_producto()
        elif respuesta.startswith("2"):
            listar_productos()
        elif respuesta.startswith("3"):
            consultar_chatbot()
        elif respuesta.startswith("4"):
            limpiar_pantalla()
            print("Saliendo del sistema...\n")
            break

if __name__ == "__main__":
    menu()