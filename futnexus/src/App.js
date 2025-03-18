import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal,Navbar, Nav, Button, Form, Card, Container, Row, Col } from "react-bootstrap";
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
    <>
 {/* Barra de navegación */}
 <Navbar bg="primary" variant="dark" expand="lg" className="px-4">
        <Navbar.Brand href="#" className="fw-bold text-white">
          FutNexus
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link href="#" className="text-white">Inicio</Nav.Link>
          <Nav.Link href="#" className="text-white">Equipos</Nav.Link>
          <Nav.Link href="#" className="text-white">Jugadores</Nav.Link>
          <Nav.Link href="#" className="text-white">Estadísticas</Nav.Link>
          <Nav.Link href="#" className="text-white">Contacto</Nav.Link>
          <Button variant="light" className="ms-3">Iniciar sesión</Button>
        </Nav>
      </Navbar>

      {/* Sección principal */}
      <header className="text-center text-white d-flex flex-column align-items-center justify-content-center"
        style={{
          background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('data:image/jpeg;base64,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')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "60vh",
        }}>
        <h1 className="fw-bold display-4">FutNexus</h1>
        <p className="lead w-50">
          Bienvenido a <strong>FutNexus</strong>, la plataforma definitiva para los apasionados del fútbol. Aquí puedes debatir sobre tus equipos favoritos, seguir las últimas noticias, conectar con otros fanáticos y hasta organizar partidos con amigos. ⚽🔥
          ¡Únete y vive el fútbol como nunca antes!
        </p>
        <div>
          <Button variant="primary" className="me-2">Explorar ahora</Button>
          <Button variant="outline-light">Regístrate gratis</Button>
        </div>
      </header>

    <Container className="mt-4">
      <h2 className="text-center">Equipos de Futbol</h2>
      <Button className="mb-3" onClick={() => setShowForm(true)}>Agregar Equipo</Button>
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
                  <strong>Partidos jugados</strong> {producto.price}
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
          <Modal.Title>Agregar Nuevo Equipo</Modal.Title>
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
              <Form.Label>Partidos jugados</Form.Label>
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
    </>
  );
}

export default App;
