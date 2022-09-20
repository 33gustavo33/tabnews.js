import {user, admin, waitForClientsToConnect} from "../orchestrator.js"

beforeAll(async () => {
    await waitForClientsToConnect()
})

describe("Usuarios", () => {
    test("Usuario admin obtendo o usuario padrão", async () => {
       const userFetched = await admin.users.get(user.user.username).catch(() => {})

       expect(userFetched.username).toEqual(user.user.username)
       expect(userFetched.id).toEqual(user.user.id)
    })

    test("Usuario padrão obtendo o usuario admin", async () => {
        const userFetched = await user.users.get(admin.user.username).catch(() => {})

        expect(userFetched.username).toEqual(admin.user.username)
        expect(userFetched.id).toEqual(admin.user.id)
    })
})