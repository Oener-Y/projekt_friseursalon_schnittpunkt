import express from 'express'
import dotenv from 'dotenv'

import leistungRoutes from './src/routes/leistung.routes.js'
import mitarbeiterRoutes from './src/routes/mitarbeiter.routes.js'
import termineRoutes from './src/routes/termine.routes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.use(express.static('assets'))
app.use(express.static('.'))

app.use('/api/leistungen', leistungRoutes)
app.use('/api/mitarbeiter', mitarbeiterRoutes)
app.use('/api/termine', termineRoutes)

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`)
})