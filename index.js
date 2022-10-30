const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const stripe = require('stripe')('sk_test_51LEKnaJ4lufim0SgI5e76tPEkitvmhY1CmwInaMGCARUJyJDTOlxFL8wfB2bwc4vkKFYwp1z4Wp8VXpyVLXM4PQC00GNnIaD2b')
let db = mongoose.connection


const app = express()

app.use(cors())
app.use(express.json())
mongoose.connect(process.env.DB_URL)


const ProductSchema = require('./Schemas/ProductSchema')
const Products = mongoose.model('Products', ProductSchema)

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


app.post('/checkout', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                return {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: item.team,
                            description: `Tamanho: ${item.size} | Nome Personalizado: ${item.namePerso} | Numero Personalizado: ${item.number} `
                        },
                        unit_amount: item.price * 100
                    },
                    quantity: item.quantity
                }
            }),
            success_url: 'https://www.youtube.com/',
            cancel_url: 'https://github.com/GabrielParreirass/'
        })
        res.send(session.url)
    } catch (error) {
        res.send(error)
    }
})


db.on('error', () => { console.log('Houve um erro') })
db.once('open', () => { console.log('DataBase loaded') })

const port = process.env.PORT || 3001
app.listen(port, (req, res) => {
    console.log('Listening on 3001')
})