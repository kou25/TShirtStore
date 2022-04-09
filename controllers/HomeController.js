import { BigPromise } from "../middlewares/bigPromise";

export const Home = BigPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Hello from API"
  });
});
