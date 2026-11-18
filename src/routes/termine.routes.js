import express from 'express'
import * as terminController from '../controller/termin.controller.js'

const router = express.Router()

router.get('/', terminController.getTermine)
router.post('/', terminController.createTermin)
router.get('/verfuegbarkeit', terminController.getVerfuegbarkeit)
router.delete('/:id', terminController.cancelTermin)

export default router