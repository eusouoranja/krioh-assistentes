import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminPanel() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [quantidade, setQuantidade] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
  const [materialEmail, setMaterialEmail] = useState('');
  const [materialTipo, setMaterialTipo] = useState('texto');
  const [materialConteudo, setMaterialConteudo] = useState('');

  useEffect(() => {
    if (!user || !user.admin) {
      navigate('/login');
      return;
    }
    fetchClientes();
    // eslint-disable-next-line
  }, [user, token, navigate]);

  async function fetchClientes() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:3001/admin/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(res.data.clientes || []);
    } catch (err) {
      setError('Erro ao buscar clientes.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDialog = (client) => {
    setSelectedClient(client);
    setQuantidade(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
    setQuantidade(0);
  };

  const handleAjustarCreditos = async () => {
    try {
      await axios.post('http://localhost:3001/admin/clients/credits', {
        email: selectedClient.email,
        quantidade: Number(quantidade)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Créditos ajustados com sucesso!', severity: 'success' });
      handleCloseDialog();
      fetchClientes();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao ajustar créditos.', severity: 'error' });
    }
  };

  const handleOpenMaterialDialog = () => {
    setMaterialEmail('');
    setMaterialTipo('texto');
    setMaterialConteudo('');
    setOpenMaterialDialog(true);
  };

  const handleCloseMaterialDialog = () => setOpenMaterialDialog(false);

  const handleUploadMaterial = async () => {
    try {
      await axios.post('http://localhost:3001/admin/materials', {
        email: materialEmail,
        tipo: materialTipo,
        conteudo: materialConteudo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Material salvo com sucesso!', severity: 'success' });
      handleCloseMaterialDialog();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao salvar material.', severity: 'error' });
    }
  };

  if (!user || !user.admin) return null;

  return (
    <Box p={3} bgcolor="#f5f5f5" minHeight="100vh">
      <Paper elevation={2} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Painel Administrativo</Typography>
        <Button variant="outlined" color="secondary" onClick={logout}>Sair</Button>
      </Paper>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" mb={2}>Clientes Cadastrados</Typography>
          <Button variant="contained" onClick={handleOpenMaterialDialog}>Upload de Material</Button>
        </Box>
        {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Créditos</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.nome}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.creditos}</TableCell>
                    <TableCell>{c.criadoEm ? new Date(c.criadoEm._seconds * 1000).toLocaleDateString('pt-BR') : ''}</TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" onClick={() => handleOpenDialog(c)}>Ajustar Créditos</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Ajustar Créditos</DialogTitle>
        <DialogContent>
          <Typography mb={2}>Cliente: <b>{selectedClient?.nome}</b> ({selectedClient?.email})</Typography>
          <TextField
            label="Quantidade (pode ser negativa)"
            type="number"
            fullWidth
            value={quantidade}
            onChange={e => setQuantidade(e.target.value)}
            inputProps={{ step: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleAjustarCreditos} variant="contained" disabled={quantidade === 0}>Salvar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openMaterialDialog} onClose={handleCloseMaterialDialog}>
        <DialogTitle>Upload/Simulação de Material</DialogTitle>
        <DialogContent>
          <TextField
            label="E-mail do Cliente"
            type="email"
            fullWidth
            margin="normal"
            value={materialEmail}
            onChange={e => setMaterialEmail(e.target.value)}
          />
          <TextField
            label="Tipo (ex: texto, link, pdf)"
            fullWidth
            margin="normal"
            value={materialTipo}
            onChange={e => setMaterialTipo(e.target.value)}
          />
          <TextField
            label="Conteúdo ou link"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            value={materialConteudo}
            onChange={e => setMaterialConteudo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMaterialDialog}>Cancelar</Button>
          <Button onClick={handleUploadMaterial} variant="contained" disabled={!materialEmail || !materialTipo || !materialConteudo}>Salvar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
} 