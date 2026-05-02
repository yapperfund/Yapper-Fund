import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fundsRouter from "./funds";
import investorsRouter from "./investors";
import investmentsRouter from "./investments";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fundsRouter);
router.use(investorsRouter);
router.use(investmentsRouter);
router.use(statsRouter);

export default router;
