import {user, admin, waitForClientsToConnect} from "../orchestrator.js"

beforeAll(async () => {
    await waitForClientsToConnect()
})

describe("Usuarios", () => {
    test("Usuario admin obtendo o usuario padrão", async () => {
       const userFetched = await admin.users.get(user.user.get().username).catch(() => {})

       expect(userFetched).not.toEqual(user.user.get())
       expect(userFetched.username).toEqual(user.user.get().username)
       expect(userFetched.id).toEqual(user.user.get().id)
    })

    test("Usuario padrão obtendo o usuario admin", async () => {
        const userFetched = await user.users.get(admin.user.get().username).catch(() => {})

        expect(userFetched).not.toEqual(admin.user.get())
        expect(userFetched.username).toEqual(admin.user.get().username)
        expect(userFetched.id).toEqual(admin.user.get().id)
    })
})