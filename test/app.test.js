const request = require('supertest');
const { app, resetar } = require('../src/app');

beforeEach(() => resetar());

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('CRUD de tarefas', () => {
  it('cria uma tarefa', async () => {
    const res = await request(app).post('/tarefas').send({ titulo: 'Estudar DevSecOps' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, titulo: 'Estudar DevSecOps', concluida: false });
  });

  it('nao cria tarefa sem titulo', async () => {
    const res = await request(app).post('/tarefas').send({});
    expect(res.status).toBe(400);
  });

  it('lista e filtra tarefas', async () => {
    await request(app).post('/tarefas').send({ titulo: 'A' });
    await request(app).post('/tarefas').send({ titulo: 'B' });
    await request(app).patch('/tarefas/1').send({ concluida: true });

    const todas = await request(app).get('/tarefas');
    expect(todas.body).toHaveLength(2);

    const concluidas = await request(app).get('/tarefas?concluida=true');
    expect(concluidas.body).toHaveLength(1);
    expect(concluidas.body[0].titulo).toBe('A');
  });

  it('busca tarefa por id', async () => {
    await request(app).post('/tarefas').send({ titulo: 'A' });
    const res = await request(app).get('/tarefas/1');
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('A');
  });

  it('retorna 404 para tarefa inexistente', async () => {
    expect((await request(app).get('/tarefas/99')).status).toBe(404);
    expect((await request(app).patch('/tarefas/99').send({ titulo: 'x' })).status).toBe(404);
    expect((await request(app).delete('/tarefas/99')).status).toBe(404);
  });

  it('atualiza o titulo', async () => {
    await request(app).post('/tarefas').send({ titulo: 'A' });
    const res = await request(app).patch('/tarefas/1').send({ titulo: ' Novo ' });
    expect(res.body.titulo).toBe('Novo');
  });

  it('rejeita titulo invalido na atualizacao', async () => {
    await request(app).post('/tarefas').send({ titulo: 'A' });
    const res = await request(app).patch('/tarefas/1').send({ titulo: '' });
    expect(res.status).toBe(400);
  });

  it('remove uma tarefa', async () => {
    await request(app).post('/tarefas').send({ titulo: 'A' });
    const res = await request(app).delete('/tarefas/1');
    expect(res.status).toBe(204);
    expect((await request(app).get('/tarefas')).body).toHaveLength(0);
  });
});
