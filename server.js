const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("./database.db");

db.run(`
CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itens TEXT,
    total REAL,
    status TEXT
)
`);

const TOKEN = process.env.TOKEN;

app.post("/pedido", async (req, res) => {

    const { itens, total } = req.body;

    db.run(
        "INSERT INTO pedidos (itens, total, status) VALUES (?, ?, ?)",
        [JSON.stringify(itens), total, "pendente"],
        async function(err) {

            const pedidoId = this.lastID;

            try {
                const response = await axios.post(
                    "https://api.pagseguro.com/orders",
                    {
                        reference_id: "pedido-" + pedidoId,
                        customer: {
                            name: "Cliente",
                            email: "cliente@email.com",
                            tax_id: "83784322034"
                        },
                        items: [
                            {
                                name: "Pedido PERSONALIZE CABAL",
                                quantity: 1,
                                unit_amount: parseInt(total * 100)
                            }
                        ],
                        charges: [
                            {
                                amount: {
                                    value: parseInt(total * 100),
                                    currency: "BRL"
                                },
                                payment_method: {
                                    type: "PIX",
                                    installments: 1,
                                    capture: true
                                }
                            }
                        ]
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${TOKEN}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const pix = response.data.charges[0].last_transaction.qr_code;

                res.json({ pix, pedidoId });

            } catch (e) {
                console.log(e.response?.data || e);
                res.status(500).send("Erro ao gerar Pix");
            }
        }
    );
});

app.get("/pedidos", (req, res) => {
    db.all("SELECT * FROM pedidos", (err, rows) => {
        res.json(rows);
    });
});

app.post("/status", (req, res) => {
    db.run(
        "UPDATE pedidos SET status=? WHERE id=?",
        [req.body.status, req.body.id]
    );
    res.sendStatus(200);
});

app.listen(3000, () => console.log("Servidor rodando"));
