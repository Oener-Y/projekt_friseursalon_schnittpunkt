import express from 'express'
import * as mitarbeiterController from '../controller/mitarbeiter.controller.js'

const router = express.Router()

router.get('/', mitarbeiterController.getMitarbeiter)
router.get('/leistung/:leistungId', mitarbeiterController.getMitarbeiterByLeistung)

export default router