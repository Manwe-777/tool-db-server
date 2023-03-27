import { Express } from "express";
import { ToolDb } from "tool-db";

export default function expressSetup(app: Express, db: ToolDb) {
  // Setup Express
  app.get("/", (_req: any, res: any) => {
    res.json({ ok: true, msg: "You found the root!" });
  });

  app.get("/id", (_req: any, res: any) => {
    res.json({ id: db.network.getClientAddress() });
  });

  app.get("/peer", (_req: any, res: any) => {
    res.json({ id: db.network.getMeAsPeer() });
  });

  app.get("/api/:id", (_req, res: any) => {
    db.store
      .get(_req.params.id)
      .then((data) => {
        if (!data) {
          res.json({ msg: "not found" });
        } else {
          try {
            const d = JSON.parse(data);
            res.json(d);
          } catch (e) {
            res.json({ msg: e });
          }
        }
      })
      .catch((_e) => {
        res.json({ msg: "not found" });
      });
  });
}
