const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

const client = new MercadoPagoConfig({
    accessToken: process.env.TOKEN
});

app.post("/pedido", async (req, res) => {
    try {

        const payment = new Payment(client);

        const result = await payment.create({
            body: {
                transaction_amount: 10,
                description: "Pedido PERSONALIZE CABAL",
                payment_method_id: "pix",
                payer: {
                    email: "teste@teste.com"
                }
            }
        });

        const dados = result.point_of_interaction.transaction_data;

        res.json({
            qr_code: dados.qr_code
        });

    } catch (error) {
        console.log("ERRO REAL:", error);
        res.status(500).send("Erro ao gerar Pix");
    }
});

app.listen(3000, () => console.log("Servidor rodando"));
