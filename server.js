const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

// verifica se o token existe
if (!process.env.TOKEN) {
    console.log("❌ TOKEN NÃO CONFIGURADO");
}

const client = new MercadoPagoConfig({
    accessToken: process.env.TOKEN
});

app.post("/pedido", async (req, res) => {
    try {

        const payment = new Payment(client);

        const result = await payment.create({
            body: {
                transaction_amount: Number(req.body.total) || 10,
                description: "Pedido PERSONALIZE CABAL",
                payment_method_id: "pix",
                payer: {
                    email: "seuemail@gmail.com"
                }
            }
        });

        // proteção contra erro
        const dados = result?.point_of_interaction?.transaction_data;

        if (!dados) {
            console.log("⚠️ RESPOSTA COMPLETA:", result);
            return res.status(500).send("Erro ao obter dados do Pix");
        }

        res.json({
            qr_code: dados.qr_code,
            qr_code_base64: dados.qr_code_base64
        });

    } catch (error) {
        console.log("❌ ERRO REAL:", error);
        res.status(500).send("Erro ao gerar Pix");
    }
});

// rota de teste (opcional)
app.get("/", (req, res) => {
    res.send("Servidor rodando!");
});

app.listen(3000, () => console.log("🚀 Servidor rodando"));
