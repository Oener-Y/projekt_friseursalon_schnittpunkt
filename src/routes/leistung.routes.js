import express from 'express'
import * as leistungController from '../controller/leistung.controller.js'

const router = express.Router()

router.get('/', leistungController.getLeistungen)

export default router