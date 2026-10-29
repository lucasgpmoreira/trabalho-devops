const { app } = require('./app');

const porta = process.env.PORT || 3000;

app.listen(porta, () => {
  console.log(`API rodando na porta ${porta}`);
});
