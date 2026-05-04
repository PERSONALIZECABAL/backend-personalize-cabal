const mercadopago = require("mercadopago");

mercadopago.configure({
    APP_USR-fa7a2beb-7616-44dd-85b6-d685d2ecb259: process.env.TOKEN
});

app.post("/pedido", async (req, res) => {

    const { itens, total } = req.body;

    try {

        const pagamento = await mercadopago.payment.create({
            transaction_amount: Number(total),
            description: "Pedido PERSONALIZE CABAL",
            payment_method_id: "pix",
            payer: {
                email: "pablo.lancabal@hotmail.com"
            }
        });

        const pix = pagamento.body.point_of_interaction.transaction_data;

        res.json({
            qr_code: pix.qr_code,
            qr_code_base64: pix.qr_code_base64
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Erro ao gerar Pix");
    }
});
