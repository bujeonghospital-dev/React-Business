import express from "express";
import { v4 as uuidv4 } from "uuid";
import {
  createVisit,
  getVisitByVn,
  listVisitsByCn,
  updateVisitByVn,
  deleteVisitByVn,
} from "../repositories/visitRepository";
import { Visit } from "../types/visit";

const router = express.Router();

router.get("/api/customers/:cn/visits", async (req: express.Request, res: express.Response) => {
  const { cn } = req.params;
  if (!cn) {
    return res.status(400).json({ error: "cn is required" });
  }
  const visits = await listVisitsByCn(cn);
  res.json(visits);
});

router.post("/api/customers/:cn/visits", async (req: express.Request, res: express.Response) => {
  const { cn } = req.params;
  if (!cn) {
    return res.status(400).json({ error: "cn is required" });
  }

  const { body } = req;
  const vn = uuidv4();
  const payload: Omit<Visit, "record_no"> = {
    ...body,
    cn,
    vn,
  } as any;

  const created = await createVisit(payload);
  res.status(201).json(created);
});

router.get("/api/visits/:vn", async (req: express.Request, res: express.Response) => {
  const { vn } = req.params;
  if (!vn) {
    return res.status(400).json({ error: "vn is required" });
  }
  const visit = await getVisitByVn(vn);
  if (!visit) {
    return res.status(404).json({ error: "Visit not found" });
  }
  res.json(visit);
});

router.put("/api/visits/:vn", async (req: express.Request, res: express.Response) => {
  const { vn } = req.params;
  if (!vn) {
    return res.status(400).json({ error: "vn is required" });
  }
  const updated = await updateVisitByVn(vn, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Visit not found" });
  }
  res.json(updated);
});

router.delete("/api/visits/:vn", async (req: express.Request, res: express.Response) => {
  const { vn } = req.params;
  if (!vn) {
    return res.status(400).json({ error: "vn is required" });
  }
  const deleted = await deleteVisitByVn(vn);
  if (!deleted) {
    return res.status(404).json({ error: "Visit not found" });
  }
  return res.status(204).end();
});

export default router;