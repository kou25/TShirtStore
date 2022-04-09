import express from "express";
import { Home } from "../controllers/HomeController";

const Router = express.Router();

Router.route("/").get(Home);

export { Router as HomeRoute };
