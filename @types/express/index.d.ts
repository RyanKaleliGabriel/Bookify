import Attendant from "../../models/Attendant";

declare global {
  namespace Express {
    interface Request {
      user?: Attendant;
    }
  }
}
