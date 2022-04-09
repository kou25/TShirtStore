import Product from "../models/Product";
import { BigPromise } from "../middlewares/bigPromise";
import CustomError from "../utils/customError";
import cloudinary from "cloudinary";
import WhereClause from "../utils/whereClause";

export const AddProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];
  if (!req.files) {
    return next(CustomError("Product images are required", 400, res));
  }

  if (req.files) {
    if (req.files.photos.length) {
      for (let index = 0; index < req.files.photos.length; index++) {
        let result = await cloudinary.v2.uploader.upload(
          req.files.photos[index].tempFilePath,
          {
            folder: "products"
          }
        );

        imageArray.push({
          id: result.public_id,
          secure_url: result.secure_url
        });
      }
    } else {
      const result = await cloudinary.v2.uploader.upload(
        req.files.photos.tempFilePath,
        {
          folder: "user",
          width: "150",
          crop: "scale"
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url
      });
    }
  }
  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    data: product,
    Message: "Product has been added successfully"
  });
});

export const GetProduct = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;

  //products.limit().skip()

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    data: products,
    count: filteredProductNumber,
    Message: ""
  });
});

export const GetSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(CustomError("Product not found", 401, res));
  }
  res.status(200).json({
    success: true,
    data: product,
    Message: ""
  });
});

export const AdminGetAllProduct = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    data: products,
    Message: ""
  });
});

export const AdminUpdateSingleProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(CustomError("Product not found", 400, res));
  }
  let imagesArray = [];
  if (req.files) {
    //destroy
    for (let index = 0; index < product.photos.length; index++) {
      const resp = await cloudinary.v2.uploader.destroy(
        product.photos[index].id
      );
    }
    //upload and save
    if (req.files.photos.length) {
      for (let index = 0; index < req.files.photos.length; index++) {
        let result = await cloudinary.v2.uploader.upload(
          req.files.photos[index].tempFilePath,
          {
            folder: "products"
          }
        );

        imagesArray.push({
          id: result.public_id,
          secure_url: result.secure_url
        });
      }
    } else {
      const result = await cloudinary.v2.uploader.upload(
        req.files.photos.tempFilePath,
        {
          folder: "user",
          width: "150",
          crop: "scale"
        }
      );
      imagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url
      });
    }
    req.body.photos = imagesArray;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product,
    Message: "Product has been updated successfully"
  });
});

export const AdminDeleteSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(CustomError("No product found", 400, res));
  if (req.files) {
    //destroy
    for (let index = 0; index < product.photos.length; index++) {
      const resp = await cloudinary.v2.uploader.destroy(
        product.photos[index].id
      );
    }
  }
  await product.remove();
  res.status(200).json({
    success: true,
    Message: "Product has been deleted successfully"
  });
});

export const AddReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  };

  const product = await Product.findById(productId);

  const AlreadyReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (AlreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  // adjust ratings
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //save

  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    Message: "Review has been updated successfully"
  });
});

export const DeleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== req.user._id.toString()
  );

  const numberOfReviews = reviews.length;

  // adjust ratings
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //update the product
  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    Message: "Review has been deleted successfully"
  });
});

export const GetOnlyReviewOfSingleProduct = BigPromise(
  async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
      success: true,
      reviews: product.reviews,
      Message: ""
    });
  }
);
