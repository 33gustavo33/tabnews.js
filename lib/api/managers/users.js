import { UserData, Content } from "../../util/types.js";
import Routes from "../Routes.js";
import BaseWatcher from "./BaseWatcher.js";
import BaseManager from "./BaseManager.js";

class UserWatcher extends BaseWatcher {
  #userConfig = {};
  #interval;
  #refreshAtMs;
  #UserManager;

  constructor(UserManager, username, observeWhat, refreshAtMs) {
    super(["features", "tabcoins", "tabcash"], observeWhat);
    this.#userConfig.username = username;
    this.#refreshAtMs = parseInt(refreshAtMs) ? parseInt(refreshAtMs) : 125000;
    this.#UserManager = UserManager;
  }
  /**
   * Começa a ouvir um evento
   * @param {"watcherUpdate"} event
   * @param {function(watcher_updateUser, eventManager):void} callback
   */
  on = (event, callback) => this.eventManager.on(event, callback); //is like this because other way JSDoc does not work

  async #fetchAndUpdateAndEmit() {
    let user = await this.#UserManager.get(this.#userConfig.username);
    if (!user) return;
    this.updateAndEmit(user);
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

class UsersManager extends BaseManager {
  /**
   * retorna todos os conteúdos de um usuario
   * @param {string} username
   * @param {"new" | "old" | "relevant"} [strategy]
   * @param {number} [page]
   * @return {Promise<Content[]>}
   * @example
   * client.users.getContentsOfUser("gustavo33", "old")
   */
  async getContentsOfUser(username, strategy = "new", page = 1) {
    const contentsFetched = await this.client.REST.get(Routes.allUserContents(username, strategy, page));
    const contents = [];
    for (const contentFetched of contentsFetched) {
      contents.push(new Content(contentFetched, this.client));
    }
    return contents;
  }

  /**
   * obtém um usuario
   * @param {string} username
   * @returns {Promise<UserData>}
   * @example
   * client.users.get("gustavo33")
   */
  async get(username) {
    const user = await this.client.REST.get(Routes.users(username));

    return new UserData(user, this.client);
  }

  /**
   * assiste um usuário
   * @param {string} username
   * @param {Array<"features" | "tabcoins" | "tabcash">} [observeWhat]
   * @param {number} ms
   * @returns {UserWatcher}
   */
  watch(username, observeWhat, ms) {
    return new UserWatcher(this, username, observeWhat, ms);
  }
}

export default UsersManager;
