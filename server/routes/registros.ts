import express from 'express';
import { executeQuery } from '../database';

const router = express.Router();

// Crear nuevo registro de leche
router.post('/', async (req, res) => {
  try {
    const { fkFinca, cantidad, saldo, fkUsuario, fechaHora } = req.body;

    if (!fkFinca || !cantidad || !fkUsuario) {
      return res.status(400).json({ 
        success: false, 
        message: 'fkFinca, cantidad y fkUsuario son requeridos' 
      });
    }

    // Si se proporciona fechaHora, usarla; si no, usar CURRENT_TIMESTAMP
    let query, params;
    if (fechaHora) {
      query = 'INSERT INTO registro_leche (fkFinca, cantidad, saldo, fechaHora, fkUsuario) VALUES (?, ?, ?, ?, ?)';
      params = [fkFinca, cantidad, saldo || 0, fechaHora, fkUsuario];
    } else {
      query = 'INSERT INTO registro_leche (fkFinca, cantidad, saldo, fkUsuario) VALUES (?, ?, ?, ?)';
      params = [fkFinca, cantidad, saldo || 0, fkUsuario];
    }

    const result: any = await executeQuery(query, params);

    res.status(201).json({ 
      success: true, 
      message: 'Registro creado exitosamente',
      registroId: result.insertId 
    });

  } catch (error) {
    console.error('Error creando registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Sincronizar múltiples registros
router.post('/sync', async (req, res) => {
  try {
    const { registros } = req.body;

    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere un array de registros' 
      });
    }

    const syncedIds = [];
    const errors = [];

    for (const registro of registros) {
      try {
        const { fkFinca, cantidad, saldo, fkUsuario, fechaHora, tempId } = registro;

        if (!fkFinca || !cantidad || !fkUsuario) {
          errors.push({ tempId, error: 'Datos incompletos' });
          continue;
        }

        let query, params;
        if (fechaHora) {
          query = 'INSERT INTO registro_leche (fkFinca, cantidad, saldo, fechaHora, fkUsuario) VALUES (?, ?, ?, ?, ?)';
          params = [fkFinca, cantidad, saldo || 0, fechaHora, fkUsuario];
        } else {
          query = 'INSERT INTO registro_leche (fkFinca, cantidad, saldo, fkUsuario) VALUES (?, ?, ?, ?)';
          params = [fkFinca, cantidad, saldo || 0, fkUsuario];
        }

        const result: any = await executeQuery(query, params);
        syncedIds.push({ tempId, realId: result.insertId });

      } catch (error) {
        console.error('Error sincronizando registro individual:', error);
        errors.push({ tempId: registro.tempId, error: 'Error de base de datos' });
      }
    }

    res.json({ 
      success: true, 
      message: `${syncedIds.length} registros sincronizados exitosamente`,
      syncedIds,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error en sincronización masiva:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener registros por finca
router.get('/finca/:fincaId', async (req, res) => {
  try {
    const { fincaId } = req.params;
    const query = `
      SELECT r.*, f.nombre as nombreFinca, u.usuario 
      FROM registro_leche r 
      JOIN finca f ON r.fkFinca = f.id 
      JOIN user u ON r.fkUsuario = u.id 
      WHERE r.fkFinca = ? 
      ORDER BY r.fechaHora DESC
    `;
    const results = await executeQuery(query, [fincaId]);

    res.json({ 
      success: true, 
      registros: results 
    });

  } catch (error) {
    console.error('Error obteniendo registros:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener todos los registros
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT r.*, f.nombre as nombreFinca, u.usuario 
      FROM registro_leche r 
      JOIN finca f ON r.fkFinca = f.id 
      JOIN user u ON r.fkUsuario = u.id 
      ORDER BY r.fechaHora DESC
      LIMIT 100
    `;
    const results = await executeQuery(query);

    res.json({ 
      success: true, 
      registros: results 
    });

  } catch (error) {
    console.error('Error obteniendo registros:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

export default router;