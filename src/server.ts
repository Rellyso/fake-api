import jsonServer from 'json-server';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express'
import { QueryStatus } from './types/entities/query-status'

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, '..', 'db.json'))
const middlewares = jsonServer.defaults()


server.use(jsonServer.bodyParser);


// Middleware para adicionar atrasos nas respostas (opcional)
server.use(middlewares)

server.use((req, res, next) => {
  setTimeout(() => next(), 1300)
})

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

server.get('/query-status/count', (req: Request, res: Response) => {
  const db = router.db<QueryStatus> // Obter a instância do lowdb
  const queryStatus = db.get('clients') as QueryStatus[] // Contar os itens na coleção 'items'

  const counts = queryStatus.reduce((acc, item) => {
    switch (item.status) {
      case 0:
        acc.total++
        acc.approvedConsult++
        break
      case 1:
        acc.pending++
        break
      case 2:
        acc.finished++
        break
      case 3:
      case 4:
        acc.pending++
        break
      case 5:
      case 6:
        acc.finished++
        break
      case 7:
        acc.total++
        acc.purchased++
        break
      case 8:
        acc.finished++
        break
      case 9:
        acc.pending++
        break
    }

    return acc
  }, { approvedConsult: 0, pending: 0, finished: 0, purchased: 0, total: 0 })

  res.json(counts)
})

server.use(router)

const PORT = 8000
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`)
})