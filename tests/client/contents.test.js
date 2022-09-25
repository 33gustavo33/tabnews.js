import {admin, waitForClientsToConnect, postContent, clearContents, getCache, deleteContent} from "../orchestrator.js"

beforeAll(async () => {
    await waitForClientsToConnect()
})

describe("Conteúdos do client", () => {
    test("Postar conteúdos", async () => {
        const [content1, content2] = await postContent({title: "Olá", body: "Mundo!", customSlug: "test-contents-post"})
        
        expect(content1.status).toBe("published")
        expect(content2.status).toBe("published")
        expect(content1.body).toBe("Mundo!")
        expect(content2.body).toBe("Mundo!")
    })

    test("Obter conteúdo", async () => {
        const [content1] = getCache().contents

        const contentFetched = await admin.contents.get(content1.owner.username, content1.slug)

        expect(content1).toEqual(contentFetched)
    })

    test("Editar conteúdos", async () => {
        const [content1] = getCache().contents

        const contentEdited = await admin.contents.edit(content1.owner.username, content1.slug, {body: "Mundo?"})

        expect(content1).not.toEqual(contentEdited)
        expect(content1.slug).toBe(contentEdited.slug)
    })

    test("Deletar conteúdos", async () => {
        const [content1] = getCache().contents

        const contentDeleted = await deleteContent(content1)
        
        expect(content1.slug).toBe(contentDeleted.slug)
        expect(content1.status).toBe("published")
        expect(contentDeleted.status).toBe("deleted")
    })
})

afterAll(async () => {
    await clearContents()
})