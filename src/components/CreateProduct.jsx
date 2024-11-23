import React, { useEffect, useState } from 'react';
import { database } from "../firebaseConfig";
import { ref, push, onValue } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
    const [materials, setMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [productName, setProductName] = useState("");
    const [approxSales, setApproxSales] = useState("");
    const [profitMargin, setProfitMargin] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const materialsRef = ref(database, 'materiales');
            onValue(materialsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const userMaterials = Object.keys(data)
                        .filter(key => data[key].userID === user.uid)
                        .map(key => ({
                            id: key,
                            ...data[key]
                        }));
                    setMaterials(userMaterials);
                } else {
                    setMaterials([]);
                }
            });
        }
    }, []);

    const handleSelectMaterial = (material) => {
        setSelectedMaterials((prev) => {
            if (prev.includes(material)) {
                return prev.filter((item) => item.id !== material.id);
            } else {
                return [...prev, material];
            }
        });
    };

    const handleCreateProduct = () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            alert("Usuario no autenticado");
            return;
        }

        if (selectedMaterials.length === 0) {
            alert("Por favor selecciona al menos un material para crear el producto.");
            return;
        }
        if (!productName || !approxSales || !profitMargin) {
            alert("Por favor completa todos los campos.");
            return;
        }

        // Objeto del producto que queremos guardar, incluyendo el userID
        const newProduct = {
            nombre: productName,
            ventasAproximadas: approxSales,
            rentabilidad: profitMargin,
            userID: user.uid,  // Añadir el ID del usuario
            materiales: selectedMaterials.map((material) => material.id) // Guardar solo el ID de los materiales
        };

        // Referencia a la base de datos en 'productos'
        const productsRef = ref(database, 'productos');

        // Guardar el producto en Firebase
        push(productsRef, newProduct)
            .then(() => {
                alert(`Producto "${productName}" creado con éxito.`);
                // Limpiar los campos después de guardar
                setProductName("");
                setApproxSales("");
                setProfitMargin("");
                setSelectedMaterials([]);
                navigate("/"); // Redirigir después de crear el producto
            })
            .catch((error) => {
                console.error("Error al guardar el producto en Firebase:", error);
                alert("Hubo un error al crear el producto. Inténtalo nuevamente.");
            });
    };

    return (
        <div className="container">
            <h2>Crear Producto</h2>
            <label>
                Nombre del Producto:
                <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                />
            </label>
            <label>
                Cantidad Aproximada de Ventas:
                <input
                    type="number"
                    value={approxSales}
                    onChange={(e) => setApproxSales(e.target.value)}
                    required
                />
            </label>
            <label>
                Porcentaje de Rentabilidad:
                <input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                    required
                />
            </label>
            <p>Selecciona los materiales necesarios para la fabricación de tu producto:</p>
            <div className="materials-list">
                {materials.length === 0 ? (
                    <p>No tienes materiales guardados.</p>
                ) : (
                    materials.map((material) => (
                        <div key={material.id} className="material-card">
                            <input
                                type="checkbox"
                                onChange={() => handleSelectMaterial(material)}
                                checked={selectedMaterials.includes(material)}
                            />
                            <label>{material.nombre} - {material.cantidad} {material.unidadMedida}</label>
                        </div>
                    ))
                )}
            </div>
            <button onClick={handleCreateProduct} className="create-product-button">
                Crear Producto
            </button>
            <button onClick={() => navigate("/home")} className="back-button">
                Regresar
            </button>
        </div>
    );
};

export default CreateProduct;
