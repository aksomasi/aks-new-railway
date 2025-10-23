import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { MenuController } from '../controllers/menuController';
import { AddonController } from '../controllers/addonController';
import { OrderController } from '../controllers/orderController';
import { upload } from '../middleware/upload';

const router = Router();

// Controllers
const categoryController = new CategoryController();
const menuController = new MenuController();
const addonController = new AddonController();
const orderController = new OrderController();

// Category routes
router.get('/categories', categoryController.getAll.bind(categoryController));
router.post('/categories', categoryController.create.bind(categoryController));
router.put('/categories/:id', categoryController.update.bind(categoryController));
router.delete('/categories/:id', categoryController.delete.bind(categoryController));

// Menu routes
router.get('/menu', menuController.getAll.bind(menuController));
router.post('/menu', upload.single('image'), menuController.create.bind(menuController));
router.put('/menu/:id', upload.single('image'), menuController.update.bind(menuController));
router.delete('/menu/:id', menuController.delete.bind(menuController));

// Addon routes
router.get('/addons', addonController.getAll.bind(addonController));
router.post('/addons', addonController.create.bind(addonController));
router.put('/addons/:id', addonController.update.bind(addonController));
router.delete('/addons/:id', addonController.delete.bind(addonController));

// Order routes
router.get('/orders', orderController.getAll.bind(orderController));
router.post('/orders', orderController.create.bind(orderController));
router.put('/orders/:id', orderController.updateStatus.bind(orderController));
router.get('/orders/:id', orderController.getById.bind(orderController));

export default router;