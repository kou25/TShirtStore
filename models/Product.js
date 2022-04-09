import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide Product name"],
    trim: true,
    maxLength: [120, "Product name shouldnot be longer than 120 characters"]
  },
  price: {
    type: Number,
    required: [true, "Please provide Product price"],
    maxLength: [5, "Product price shouldnot be longer than 5 digits"]
  },
  description: {
    type: String,
    required: [true, "Please provide Product description"]
  },
  photos: [
    {
      id: {
        type: String,
        required: true
      },
      secure_url: {
        type: String,
        required: true
      }
    }
  ],
  category: {
    type: String,
    required: [true, "Please select a category"],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirts", "Hoodies"],
      message: "Please select a valid category"
    }
  },
  stock: {
    type: Number,
    required: [true, "please add a number in stock"]
  },
  brand: {
    type: String,
    required: [true, "Please provide a brand name"]
  },
  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Product", productSchema);
