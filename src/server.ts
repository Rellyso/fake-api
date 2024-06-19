import jsonServer from 'json-server';
import path from 'path';
import fs from 'fs';

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '..', 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use(jsonServer.bodyParser);


// Middleware para adicionar atrasos nas respostas (opcional)
server.use((req, res, next) => {
  setTimeout(() => next(), 1300);
});

server.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    const { cpf, phoneNumber } = req.body;
    const dbPath = path.join(__dirname, '..', 'db.json');
    const dbJson = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbJson);

    const client = db.clients.find((client: any) => client.cpf === cpf);

    if (client && client.blocked) {
      return res.status(400).json({ error: "Houve um problema com o CPF consultado e por isso não podemos seguir" });
    }

    if (!client || client.phoneNumber !== phoneNumber) {
      return res.status(400).json({ error: "Existe outro número de celular associado a este CPF e por isso não é possível realizar a consulta. Verifique com o cliente o celular cadastrado anteriormente para consultar o crédito disponível" });
    }
  }
  next();
});

server.use(router);

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});