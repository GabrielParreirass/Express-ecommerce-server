const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
let db = mongoose.connection


const app = express()

app.use(cors())
app.use(express.json())
mongoose.connect(process.env.DB_URL)


const ProductSchema = require('./Schemas/ProductSchema')
const Products = mongoose.model('Products', ProductSchema)

app.get('/getForHome', async (req, res) => {
    const allProducts = await Products.find({ mainPage: 'true' })

    res.send(allProducts)
})

app.get('/getAll', async (req, res) => {

    const allProducts = await Products.find({})

    res.send(allProducts)
})

app.get('/getBasquete', async (req, res) => {
    const basqueteProducts = await Products.find({ sport: 'basquete' })

    res.send(basqueteProducts)
})
app.get('/getFutebol', async (req, res) => {
    const futebolProducts = await Products.find({ sport: 'futebol' })

    res.send(futebolProducts)
})

app.get('/products/:id', async (req, res) => {
    const productId = req.params.id

    try {
        const selectedProduct = await Products.findOne({ _id: productId })
        res.send(selectedProduct)
    } catch (error) {
        res.send('Id invalido ou inexistente')
    }

})

app.get('/getBrasileiro', async (req, res) => {

    try {
        const selectedBrasileiros = await Products.find({ classe: 'brasileiro' })
        res.send(selectedBrasileiros)
    } catch (error) {
        res.send('Não existem produtos ainda')
    }

})

app.get('/getInternacional', async (req, res) => {

    try {
        const selectedBrasileiros = await Products.find({ classe: 'internacional' })
        res.send(selectedBrasileiros)
    } catch (error) {
        res.send('Não existem produtos ainda')
    }

})

app.get('/getSelecoes', async (req, res) => {
    try {
        const selectedSeleções = await Products.find({ classe: 'selecao' })
        res.send(selectedSeleções)
    } catch (error) {
        res.send('Não existem produtos ainda')
    }

})

app.get('/getInfantil', async (req, res) => {
    try {
        const selectedInfantil = await Products.find({ classe: 'infantil' })
        res.send(selectedInfantil)
    } catch (error) {
        res.send('Não existem produtos ainda')
    }
})


app.post('/checkout', async (req, res) => {



    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            shipping_address_collection: { allowed_countries: ['US', 'BR'] },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: { amount: 0, currency: 'brl' },
                        display_name: 'Freete Grátis',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 20 },
                            maximum: { unit: 'business_day', value: 30 },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: { amount: 1890, currency: 'brl' },
                        display_name: 'Entrega mais rapida',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 10 },
                            maximum: { unit: 'business_day', value: 20 },
                        },
                    },
                },
            ],
            line_items: req.body.items.map(item => {
                return {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: item.name,
                            description: `Tamanho: ${item.size} | Nome Personalizado: ${item.namePerso} | Numero Personalizado: ${item.number} `
                        },
                        unit_amount: item.price * 100
                    },
                    quantity: item.quantity
                }
            }),
            phone_number_collection: {
                enabled: true,
              },
            success_url: `http://localhost:3000/checkout/success`,
            cancel_url: `http://localhost:3000//checkout/cancel`
        })
        res.send(session.url)
    } catch (error) {
        res.send(error)
    }
})


db.on('error', () => { console.log('Houve um erro') })
db.once('open', () => { console.log('DataBase loaded') })

// const port = process.env.PORT || 3001

app.listen(3001, (req, res) => {
    console.log('Listening on 3001')
})