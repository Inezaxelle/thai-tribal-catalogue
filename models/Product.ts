import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IProduct extends Document {
  name: string
  tribe: string
  category: string
  story: string
  materials: string[]
  dimensions: {
    length?: number
    width?: number
    height?: number
    unit: "cm" | "inch"
  }
  price: {
    amount: number
    currency: string
  }
  images: string[]
  stockQuantity: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    tribe: {
      type: String,
      required: [true, "Tribe name is required"],
      trim: true,
      enum: {
        values: ["Karen", "Hmong", "Lisu", "Akha", "Lahu", "Yao", "Other"],
        message: "{VALUE} is not a valid tribe",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: ["Textiles", "Jewelry", "Bags", "Home Decor", "Clothing", "Accessories", "Art", "Other"],
        message: "{VALUE} is not a valid category",
      },
    },
    story: {
      type: String,
      required: [true, "Product story is required"],
      trim: true,
      maxlength: [2000, "Story cannot exceed 2000 characters"],
    },
    materials: {
      type: [String],
      required: [true, "At least one material is required"],
      validate: {
        validator: (v: string[]) => v && v.length > 0,
        message: "At least one material must be specified",
      },
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: {
        type: String,
        enum: ["cm", "inch"],
        default: "cm",
      },
    },
    price: {
      amount: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
      },
      currency: {
        type: String,
        default: "THB",
        enum: ["THB", "USD", "EUR"],
      },
    },
    images: {
      type: [String],
      validate: {
        validator: (v: string[]) => v && v.length > 0 && v.length <= 5,
        message: "Must have between 1 and 5 images",
      },
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for better query performance
ProductSchema.index({ tribe: 1, category: 1 })
ProductSchema.index({ featured: 1 })
ProductSchema.index({ createdAt: -1 })

// Prevent model recompilation in development
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

export default Product
