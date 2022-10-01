import fetch from "node-fetch";
import { config, validateUrl } from "./orchestrator.js";

test("Conexão ao tabnews: Verificar se o tabnews está online", async () => {
  const connection = await fetch(config.tabnewsUrl);

  expect(connection.ok).toBe(true);
});

test("Conexão ao tabnews: Verificar se a url do tabnews é valida", async () => {
  const valid = validateUrl(config.tabnewsUrl);

  expect(valid).toBe(true);
});
