#Usa el patrón Singleton para evitar múltiples conexiones a MySQL.
import mysql.connector

class DatabaseConnection:
    """Clase Singleton para manejar la conexión a MySQL."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._instance.connection = mysql.connector.connect(
                host="localhost",
                port=3306,
                user="root",
                password="",
                database="tienda"
            )
        return cls._instance

    def get_connection(self):
        """Devuelve la conexión a la base de datos."""
        return self.connection
