import {user, admin, waitForClientsToConnect} from "../orchestrator.js"

beforeAll(async () => {
    await waitForClientsToConnect()
})

describe("Status do client", () => {
    test("Obtendo o status do tabnews", async () => {
       const statusFetched = await user.status.get()
       
       const latency = statusFetched.database.latency
       const averageLatency = (latency[0] + latency[1] + latency[2]) / 3

       expect(statusFetched.database.averageLatency).toBe(averageLatency)
    })
})