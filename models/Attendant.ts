import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

//Attendant Interface
export interface AttendantDocument extends Document {
  name: string;
  email: string;
  image_url: string;
  biography: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  availability: object;
  next_month: boolean;
  next_week: boolean;
  password: string;
  passwordConfirm: string;
  active: boolean;
  created_at: object;
  passwordChangedAt: object;
  passwordResetToken: string;
  passwordResetExpires: object;
  correctPassword(
    candidatePassword: string,
    attendantPassword: string
  ): Promise<boolean>;
}

//Schema configuration
const attendantSchema = new Schema<AttendantDocument>({
  name: {
    type: "String",
    required: [true, "Name input is required"],
  },
  email: {
    type: String,
    required: [true, "Email input is required"],
    unique: true,
  },
  image_url: {
    type: String,
  },
  biography: {
    type: String,
    // required: [true, "Biography input is required"],
  },
  ratingsAverage: {
    type: Number,
    default: 3,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: (val: number): number => Math.round(val * 5) / 5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  availability: [
    {
      day_of_week: String,
      start_time: String,
      end_time: String,
    },
  ],
  next_month: {
    type: Boolean,
    default: false,
  },
  next_week: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "Password input is required"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Password Confirm input is required"],
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  created_at: {
    type: Date,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// passwords compare validations
attendantSchema.pre("save", function (next) {
  if (this.password !== this.passwordConfirm) {
    this.invalidate(this.password, "Passwords are not the same");
  }
  next();
});

//Pre middleware for hashing passwords
attendantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = "";
});

attendantSchema.methods.correctPassword = async function (
  candidatePassword: string,
  attendantPassword: string
) {
  return await bcrypt.compare(candidatePassword, attendantPassword);
};

const Attendant = model<AttendantDocument>("Attendant", attendantSchema);
export default Attendant;
