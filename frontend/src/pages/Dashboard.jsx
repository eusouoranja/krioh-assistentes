import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Stack, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const { user, token, logout, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [creditos, setCreditos] = useState(user?.creditos ?? '--');
  const [prompt, setPrompt] = useState('');
  const [resposta, setResposta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historico, setHistorico] = useState([]);
  const [openCompraDialog, setOpenCompraDialog] = useState(false);
  const [compraQuantidade, setCompraQuantidade] = useState(10);
  const [compraLoading, setCompraLoading] = useState(false);
  const [compraError, setCompraError] = useState('');

  // Consulta créditos e histórico ao carregar
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    async function fetchCreditosEHistorico() {
      try {
        const resCred = await axios.post('http://localhost:3001/credits', { email: user.email }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCreditos(resCred.data.creditos);
        login({ ...user, creditos: resCred.data.creditos }, token);
        // Histórico
        const resHist = await axios.post('http://localhost:3001/history', { email: user.email }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistorico(resHist.data.historico || []);
      } catch (err) {
        setCreditos('--');
        setHistorico([]);
      }
    }
    fetchCreditosEHistorico();
    // eslint-disable-next-line
  }, [user, token]);

  const handlePrompt = async () => {
    setResposta('');
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/ia/ask', { email: user.email, prompt }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResposta(res.data.resposta);
      setCreditos(res.data.creditos_restantes);
      // Atualiza créditos no contexto
      login({ ...user, creditos: res.data.creditos_restantes }, token);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao consultar IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompraDialog = () => {
    setCompraQuantidade(10);
    setCompraError('');
    setOpenCompraDialog(true);
  };
  const handleCloseCompraDialog = () => setOpenCompraDialog(false);

  const handleComprarCreditos = async () => {
    setCompraLoading(true);
    setCompraError('');
    try {
      const res = await axios.post('http://localhost:3001/credits/purchase', {
        email: user.email,
        quantidade: Number(compraQuantidade)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreditos(res.data.creditos);
      login({ ...user, creditos: res.data.creditos }, token);
      setOpenCompraDialog(false);
    } catch (err) {
      setCompraError('Erro ao comprar créditos.');
    } finally {
      setCompraLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Box p={3} bgcolor="#f5f5f5" minHeight="100vh">
      <Paper elevation={2} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h6">Bem-vindo(a), {user.nome}!</Typography>
          <Typography variant="body2" color="text.secondary">Créditos disponíveis: <b>{creditos}</b></Typography>
        </div>
        <Box display="flex" gap={2}>
          <Button variant="contained" color="primary" onClick={handleOpenCompraDialog}>Comprar Créditos</Button>
          <Button variant="outlined" color="secondary" onClick={logout}>Sair</Button>
        </Box>
      </Paper>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" mb={1}>Assistente IA</Typography>
        <TextField
          fullWidth
          label="Digite seu prompt"
          multiline
          rows={3}
          variant="outlined"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handlePrompt}
          disabled={loading || !prompt}
        >
          {loading ? <CircularProgress size={24} /> : 'Gerar Conteúdo'}
        </Button>
        {resposta && (
          <Paper elevation={0} sx={{ mt: 3, p: 2, bgcolor: '#f0f0f0' }}>
            <Typography variant="subtitle2">Resposta da IA:</Typography>
            <Typography>{resposta}</Typography>
          </Paper>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="subtitle2" mb={2}>Ações rápidas</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => setPrompt('Crie um post sobre os diferenciais da empresa')}>Criar Post</Button>
          <Button variant="outlined" onClick={() => setPrompt('Crie uma legenda para o Instagram sobre nosso produto destaque')}>Gerar Legenda</Button>
          <Button variant="outlined" onClick={() => setPrompt('Crie um roteiro de vídeo de 30s para o Instagram Reels sobre nosso produto destaque')}>Roteiro de Reels</Button>
          <Button variant="outlined" onClick={() => setPrompt('Responda uma DM de cliente interessado em nossos serviços')}>Responder DM</Button>
        </Stack>
      </Paper>
      <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
        <Typography variant="subtitle2" mb={2}>Histórico de Interações</Typography>
        {historico.length === 0 ? (
          <Typography color="text.secondary">Nenhuma interação recente.</Typography>
        ) : (
          historico.map((item, idx) => (
            <Box key={idx} mb={2}>
              <Typography variant="body2" color="text.secondary">
                {item.timestamp ? new Date(item.timestamp._seconds * 1000).toLocaleString('pt-BR') : ''}
              </Typography>
              <Typography variant="subtitle2">Prompt:</Typography>
              <Typography>{item.prompt}</Typography>
              <Typography variant="subtitle2" mt={1}>Resposta:</Typography>
              <Typography>{item.resposta}</Typography>
              <hr style={{ margin: '12px 0' }} />
            </Box>
          ))
        )}
      </Paper>
      <Dialog open={openCompraDialog} onClose={handleCloseCompraDialog}>
        <DialogTitle>Comprar Créditos</DialogTitle>
        <DialogContent>
          <TextField
            label="Quantidade"
            type="number"
            fullWidth
            margin="normal"
            value={compraQuantidade}
            onChange={e => setCompraQuantidade(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
          />
          {compraError && <Alert severity="error" sx={{ mt: 2 }}>{compraError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompraDialog}>Cancelar</Button>
          <Button onClick={handleComprarCreditos} variant="contained" disabled={compraLoading || compraQuantidade < 1}>
            {compraLoading ? <CircularProgress size={20} /> : 'Comprar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 