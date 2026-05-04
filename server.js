const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({
    APP_USR-fa7a2beb-7616-44dd-85b6-d685d2ecb259: process.env.TOKEN
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
                    email: "pablo.lancabal@hotmail.com"
                }
            }
        });

        const dados = result.point_of_interaction.transaction_data;

        res.json({
            qr_code: dados.qr_code,
            qr_code_base64: dados.qr_code_base64
        });

    } catch (error) {
        console.log("ERRO REAL:", error);
        res.status(500).send("Erro ao gerar Pix");
    }
});
