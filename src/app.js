const express = require('express');

const app = express();
app.use(express.json());
app.disable('x-powered-by');

// armazenamento em memoria, suficiente pro trabalho
let tarefas = [];
let proximoId = 1;

function resetar() {
  tarefas = [];
  proximoId = 1;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/tarefas', (req, res) => {
  const { concluida } = req.query;
  if (concluida === undefined) {
    return res.json(tarefas);
  }
  const filtro = concluida === 'true';
  res.json(tarefas.filter((t) => t.concluida === filtro));
});

app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) {
    return res.status(404).json({ erro: 'Tarefa nao encontrada' });
  }
  res.json(tarefa);
});

app.post('/tarefas', (req, res) => {
  const { titulo } = req.body || {};
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ erro: 'Campo titulo e obrigatorio' });
  }
  const tarefa = { id: proximoId++, titulo: titulo.trim(), concluida: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});

app.patch('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) {
    return res.status(404).json({ erro: 'Tarefa nao encontrada' });
  }
  const { titulo, concluida } = req.body || {};
  if (titulo !== undefined) {
    if (typeof titulo !== 'string' || titulo.trim() === '') {
      return res.status(400).json({ erro: 'Titulo invalido' });
    }
    tarefa.titulo = titulo.trim();
  }
  if (concluida !== undefined) {
    tarefa.concluida = Boolean(concluida);
  }
  res.json(tarefa);
});

app.delete('/tarefas/:id', (req, res) => {
  const indice = tarefas.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) {
    return res.status(404).json({ erro: 'Tarefa nao encontrada' });
  }
  tarefas.splice(indice, 1);
  res.status(204).send();
});

module.exports = { app, resetar };
