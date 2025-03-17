import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, Card, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const API_URL = "http://localhost:5000";

function App() {
  const [productos, setProductos] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    name: "",
    price: 0,
    description: "",
    image: "",
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${API_URL}/productos`);
      setProductos(response.data.productos || []);
    } catch (error) {
      console.error("Error al obtener productos", error);
    }
  };

  const handleChat = (producto) => {
    setSelectedProduct(producto);
    setShowChat(true);
  };

  const enviarPregunta = async () => {
    if (!pregunta) return;
    try {
      const response = await axios.post(`${API_URL}/chatbot`, {
        pregunta,
        product_id: selectedProduct.id,
      });
      setRespuesta(response.data.respuesta || "No se obtuvo respuesta");
    } catch (error) {
      setRespuesta("Error al comunicarse con el chatbot");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1] || ""; // 🔍 Extrae solo Base64
      setNuevoProducto((prev) => ({ ...prev, image: base64String }));
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      setNuevoProducto((prev) => ({ ...prev, image: "" })); // Evita `null`
    }
  };

  const crearProducto = async () => {
    if (!nuevoProducto.name || !nuevoProducto.price || !nuevoProducto.description) {
      alert("Todos los campos son obligatorios");
      return;
    }

    console.log("📤 Datos a enviar:", JSON.stringify(nuevoProducto, null, 2));

    try {
      await axios.post(`${API_URL}/productos`, nuevoProducto, {
        headers: { "Content-Type": "application/json" },
      });
      setShowForm(false);
      fetchProductos();
    } catch (error) {
      console.error("❌ Error al crear producto", error.response ? error.response.data : error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center">Lista de Productos</h2>
      <Button className="mb-3" onClick={() => setShowForm(true)}>Agregar Producto</Button>
      <Row>
        {productos.map((producto) => (
          <Col key={producto.id} md={4} className="mb-3">
            <Card>
              {producto.image && (
                <Card.Img variant="top" src={`data:image/png;base64,${producto.image}`} />
              )}
              <Card.Body>
                <Card.Title>{producto.name}</Card.Title>
                <Card.Text>
                  {producto.description} <br />
                  <strong>Precio:</strong> ${producto.price}
                </Card.Text>
                <Button variant="primary" onClick={() => handleChat(producto)}>
                  Preguntar al Chatbot
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal de Chat */}
      <Modal show={showChat} onHide={() => setShowChat(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Preguntar sobre {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Ingrese su pregunta"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
          />
          <Button className="mt-2" onClick={enviarPregunta}>Enviar</Button>
          {respuesta && <p className="mt-3"><strong>Chatbot:</strong> {respuesta}</p>}
        </Modal.Body>
      </Modal>

      {/* Modal de Crear Producto */}
      <Modal show={showForm} onHide={() => setShowForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, price: parseFloat(e.target.value) || 0 })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Imagen</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            <Button className="mt-3" onClick={crearProducto}>Crear</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default App;
