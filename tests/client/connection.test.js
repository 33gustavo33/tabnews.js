import { user, admin, waitForClientsToConnect } from "../orchestrator.js";

beforeAll(async () => {
  await waitForClientsToConnect();
});

describe("Conexão do client", () => {
  test("Verificando os estados da property .connected", () => {
    expect(user.connected).toBe(true);
    expect(admin.connected).toBe(true);
  });
});
