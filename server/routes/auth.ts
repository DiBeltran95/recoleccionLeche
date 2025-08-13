import express from 'express';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../database';

const router = express.Router();

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son requeridos' 
      });
    }

    // Buscar usuario en la base de datos
    const query = 'SELECT * FROM user WHERE usuario = ?';
    const results: any = await executeQuery(query, [usuario]);

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales incorrectas' 
      });
    }

    const user = results[0];

    // Verificar contraseña (asumiendo que están hasheadas)
    // Si las contraseñas no están hasheadas, usar comparación directa
    let isValidPassword = false;
    
    try {
      // Intentar verificar con bcrypt primero
      isValidPassword = await bcrypt.compare(contrasena, user.contrasena);
    } catch (error) {
      // Si falla bcrypt, comparar directamente (contraseñas en texto plano)
      isValidPassword = contrasena === user.contrasena;
    }

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales incorrectas' 
      });
    }

    // Login exitoso
    const userResponse = {
      id: user.id,
      usuario: user.usuario
    };

    res.json({ 
      success: true, 
      user: userResponse,
      message: 'Login exitoso' 
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear usuario (opcional, para testing)
router.post('/register', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    const checkQuery = 'SELECT id FROM user WHERE usuario = ?';
    const existingUser: any = await executeQuery(checkQuery, [usuario]);

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'El usuario ya existe' 
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar nuevo usuario
    const insertQuery = 'INSERT INTO user (usuario, contrasena) VALUES (?, ?)';
    const result: any = await executeQuery(insertQuery, [usuario, hashedPassword]);

    res.status(201).json({ 
      success: true, 
      message: 'Usuario creado exitosamente',
      userId: result.insertId 
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

export default router;