import { Document, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"


export interface ClientDocument extends Document {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  image_url: string;
  passwordResetToken: string;
  passwordResetExpires: any;
  passwordChangedAt: any;
  active: boolean;
  created_at: any;
  role: string;
  correctPassword(
    candidatePassword: string,
    attendantPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

const clientSchema = new Schema<ClientDocument>({
  name: {
    type: String,
    required: [true, "Name input is required"],
  },
  email: {
    type: String,
    required: [true, "Email input is required"],
  },
  password: {
    type: String,
    required: [true, "Password input is required"],
    select: false,
  },
  passwordConfirm: {
    type: String,
  },
  image_url: {
    type: String,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  created_at: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  role: {
    type:String,
  },
});

clientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = "";
  next();
});

clientSchema.pre("save", function (next) {
  if (this.password !== this.passwordConfirm) {
    this.invalidate(this.password, "Passwords are not the same");
  }
  next();
});

clientSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

clientSchema.methods.changedPasswordAfter = function (JwtTimeStanmp: number) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      String(this.passwordChangedAt / 1000),
      10
    );

    return JwtTimeStanmp < changedTimeStamp;
  }
  return false;
};

clientSchema.methods.correctPassword = async function (
  candidatePassword: string,
  clientPassword: string
) {
  return await bcrypt.compare(candidatePassword, clientPassword);
};

clientSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};



const Client = model<ClientDocument>("Client", clientSchema);
export default Client;
