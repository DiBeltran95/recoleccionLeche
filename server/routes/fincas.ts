import express from 'express';
import { executeQuery } from '../database';

const router = express.Router();

// Obtener todas las fincas
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT id, nombre, ubicacion, vereda, propietario FROM finca ORDER BY nombre';
    const results = await executeQuery(query);

    res.json({ 
      success: true, 
      fincas: results 
    });

  } catch (error) {
    console.error('Error obteniendo fincas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener finca por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM finca WHERE id = ?';
    const results: any = await executeQuery(query, [id]);

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Finca no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      finca: results[0] 
    });

  } catch (error) {
    console.error('Error obteniendo finca:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear nueva finca (opcional)
router.post('/', async (req, res) => {
  try {
    const { nombre, ubicacion, vereda, propietario } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        success: false, 
        message: 'El nombre de la finca es requerido' 
      });
    }

    const query = 'INSERT INTO finca (nombre, ubicacion, vereda, propietario) VALUES (?, ?, ?, ?)';
    const result: any = await executeQuery(query, [nombre, ubicacion || null, vereda || null, propietario || null]);

    res.status(201).json({ 
      success: true, 
      message: 'Finca creada exitosamente',
      fincaId: result.insertId 
    });

  } catch (error) {
    console.error('Error creando finca:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

export default router;