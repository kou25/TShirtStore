import { BigPromise } from "../middlewares/bigPromise";
import Product from "../models/Product";
import Order from "../models/Order";

export const CreateOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id
  });

  res.status(200).json({
    success: true,
    data: order,
    Message: "Order has been created successfully"
  });
});

export const GetSingleOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(CustomError("please check order id", 401, res));
  }
  res.status(200).json({
    success: true,
    data: order,
    Message: ""
  });
});

export const GetLoggedInOrder = BigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });
  if (!order) {
    return next(CustomError("please check order id", 401, res));
  }
  res.status(200).json({
    success: true,
    data: order,
    Message: ""
  });
});

export const AdminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();
  res.status(200).json({
    success: true,
    data: orders,
    Message: ""
  });
});

export const AdminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "Delivered") {
    return next(CustomError("Order is already marked for delivered", 401, res));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
    Message: "Order has been updated successfully"
  });
});

export const AdminDeleteOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.remove();

  res.status(200).json({
    success: true,
    Message: "Order has been deleted successfully"
  });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}
