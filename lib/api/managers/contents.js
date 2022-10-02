import { Content } from "../../util/types.js";
import Routes from "../Routes.js";
import BaseWatcher, { dateMiddleware } from "./BaseWatcher.js";
import BaseManager from "./BaseManager.js";

/**
 * @typedef {Object} watcher_updateContent
 * @property {string} children_deep_count
 * @property {string} children_deep_count_before
 * @property {Date} updated_at
 * @property {Date} updated_at_before
 * @property {string} owner_username
 * @property {string} owner_username_before
 * @property {number} tabcoins
 * @property {number} tabcoins_before
 * @property {string} body
 * @property {string} body_before
 * @property {string} title
 * @property {string} title_before
 * @property {string} source_url
 * @property {string} source_url_before
 * @property {number} itemsChanged
 */
class ContentWatcher extends BaseWatcher {
  #contentConfig = {};
  #interval;
  #refreshAtMs;
  #ContentManager;

  constructor(ContentManager, author, slug, observeWhat, refreshAtMs) {
    super(
      ["children_deep_count", "updated_at", "owner_username", "tabcoins", "body", "title", "source_url"],
      observeWhat,
      dateMiddleware
    );
    this.#ContentManager = ContentManager;
    this.#contentConfig.author = author;
    this.#contentConfig.slug = slug;
    this.#refreshAtMs = parseInt(refreshAtMs) ? parseInt(refreshAtMs) : 125000;
  }
  /**
   * Começa a ouvir um evento
   * @param {"watcherUpdate"} event
   * @param {function(watcher_updateContent, eventManager):void} callback
   */
  on = (event, callback) => this.eventManager.on(event, callback);

  async #fetchAndUpdateAndEmit() {
    try {
      let content = await this.#ContentManager.get(this.#contentConfig.author, this.#contentConfig.slug);
      if (!content) return;
      this.updateAndEmit(content);
    } catch (error) {
      this.emit("error", error);
    }
  }

  start() {
    this.fetch();
    setInterval(() => {
      this.fetch();
    }, this.#refreshAtMs);
  }
  fetch() {
    this.#fetchAndUpdateAndEmit();
  }
  stop() {
    clearInterval(this.#interval);
  }
}

class ContentManager extends BaseManager {
  /**
   * assiste um conteúdo
   * @param {string} author
   * @param {string} slug
   * @param {Array<"children_deep_count" | "updated_at" | "owner_username" | "tabcoins" | "body" | "title" | "source_url">} [observeWhat]
   * @param {number} ms
   * @returns {ContentWatcher}
   */
  watch(author, slug, observeWhat, ms) {
    return new ContentWatcher(this, author, slug, observeWhat, ms);
  }

  /**
   * dá uma tabcoin para um conteudo
   * @param {string} author
   * @param {string} slug
   * @returns {Promise<tabcoins_result>}
   * @example
   * client.contents.upvote("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa")
   */
  upvote(author, slug) {
    return this.client.REST.post(Routes.content(author, slug), {
      body: { transaction_type: "credit" },
    });
  }

  /**
   * retira uma tabcoin de um conteudo
   * @param {string} author
   * @param {string} slug
   * @returns {Promise<tabcoins_result>}
   * @example
   * client.contents.downvote("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa")
   */
  downvote(author, slug) {
    return this.client.REST.post(Routes.content(author, slug), {
      body: { transaction_type: "debit" },
    });
  }

  /**
   * posta um conteúdo
   * @param {object} content
   * @param {string} [content.parentId]
   * @param {string} [content.customSlug]
   * @param {string} [content.title]
   * @param {string} content.body
   * @param {string} [content.sourceUrl]
   * @returns {Promise<Content>}
   * @example
   * client.contents.post({
   *    title: "Olá"
   *    body: "Mundo!"
   * })
   */
  async post(content) {
    const { parentId, customSlug, title, body, sourceUrl } = content;
    const contentPosted = await this.client.REST.post(Routes.contents(), {
      body: {
        parent_id: parentId,
        title,
        body,
        status: "published",
        source_url: sourceUrl,
        slug: customSlug,
      },
    });
    return new Content(contentPosted, this.client);
  }

  /**
   * edita um conteúdo
   * @param {string} author
   * @param {string} slug
   * @param {object} content
   * @param {string} [content.title]
   * @param {string} [content.body]
   * @param {string} [content.sourceUrl]
   * @returns {Promise<Content>}
   * @example
   * client.contents.edit("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa", {title: "Novo titulo"})
   */
  async edit(author, slug, content) {
    let { title, body, sourceUrl } = content;
    const contentEdited = await this.client.REST.patch(Routes.content(author, slug), {
      body: { title, body, status: "published", source_url: sourceUrl },
    });
    return new Content(contentEdited, this.client);
  }

  /**
   * deleta um conteúdo
   * @param {string} author
   * @param {string} slug
   * @returns {Promise<Content>}
   * @example
   * client.contents.delete("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa")
   */
  async delete(author, slug) {
    const contentDeleted = await this.client.REST.patch(Routes.content(author, slug), { body: { status: "deleted" } });
    return new Content(contentDeleted, this.client);
  }

  /**
   * obtém um conteúdo
   * @param {string} author
   * @param {string} slug
   * @returns {Promise<Content>}
   * @example
   * client.contents.get("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa")
   */
  async get(author, slug) {
    const contentFetched = await this.client.REST.get(Routes.content(author, slug));
    return new Content(contentFetched, this.client);
  }

  /**
   * retorna todos os conteúdos atuais
   * @param {"new" | "old" | "relevant"} [strategy]
   * @param {number} [page]
   * @return {Promise<Content[]>}
   * @example
   * client.contents.getContents()
   * client.contents.getContents("relevant", 3)
   * client.contents.getContents("old")
   */
  async getContents(strategy = "new", page = 1) {
    const contentsFetched = await this.client.REST.get(Routes.allContents(strategy, page));
    const contents = [];
    for (const contentFetched of contentsFetched) {
      contents.push(new Content(contentFetched, this.client));
    }
    return contents;
  }

  /**
   * retorna todos os conteúdos de um usuario
   * @param {string} username
   * @param {"new" | "old" | "relevant"} [strategy]
   * @param {number} [page]
   * @return {Promise<Content[]>}
   * @example
   * client.contents.getUserContents("gustavo33", "old")
   */
  async getUserContents(username, strategy = "new", page = 1) {
    const contentsFetched = await this.client.REST.get(Routes.allUserContents(username, strategy, page));
    const contents = [];
    for (const contentFetched of contentsFetched) {
      contents.push(new Content(contentFetched, this.client));
    }
    return contents;
  }

  /** @returns {Promise<Content>} */
  async getContentParent(author, slug) {
    const content = await this.client.REST.get(Routes.contentParent(author, slug));
    return new Content(content, this.client);
  }

  /** @returns {Promise<Content>} */
  async getContentChildren(author, slug) {
    const contentsFetched = await this.client.REST.get(Routes.contentChildren(author, slug));
    const contents = [];
    for (const contentFetched of contentsFetched) {
      contents.push(new Content(contentFetched, this.client));
    }
    return contents;
  }
}

export default ContentManager;
