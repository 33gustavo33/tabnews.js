import default_config from "./config.js";
import validator from "./util/validator.js";

import REST from "./api/Rest.js";
import logger from "./util/logger.js";
import EventManager from "./util/events.js";

import { tabNewsError } from "./util/error.js";
import { ClientUserData } from "./util/types.js";

import ContentManager from "./api/managers/contents.js";
import StatusManager from "./api/managers/status.js";
import UserManager from "./api/managers/user.js";
import UsersManager from "./api/managers/users.js";

/**
 * @typedef loginData
 * @property {string} [email]
 * @property {string} [password]
 * @property {string} [token]
 */

/**
 * @typedef config
 * @property {string} [tabnewsUrl]
 * @property {boolean} [log]
 * @property {string} [customAgentUser]
 * @property {boolean} [debug]
 */

/**
 * @typedef tabcoins_result
 * @property {number} tabcoins
 */
/**
 * A classe principal do client
 * @extends {EventManager}
 */

export default class Client extends EventManager {
  /** @type {config} */
  #config;
  /** @type {string} */
  #token;
  /** @type {string} */
  #id;
  /** @private @type {ClientUserData} */
  userData;
  /** @type {boolean} */
  #connected;
  /** @type {loginData} */
  #loginData;
  /** @type {logger} */
  logger;
  /** @type {REST} */
  REST;
  /** @private */
  managers = {
    contents: new ContentManager(this),
    status: new StatusManager(this),
    user: new UserManager(this),
    users: new UsersManager(this),
  };

  /**
   * cria o cliente.
   * @param {config} [customConfig]
   */
  constructor(customConfig = {}) {
    super();
    this.#config = validator.validateConfig(customConfig, default_config);
    this.logger = new logger(this.#config);
    this.REST = new REST(customConfig, this.logger);
    if (this.#config.debug) this.logger.printLogo();
  }

  get connected() {
    return this.#connected;
  }
  get token() {
    return this.#token;
  }
  get contents() {
    if (!this.#connected)
      throw new tabNewsError(
        "Você não pode acessar a propriedade contents do Client enquanto o Client não está logado."
      );
    return this.managers.contents;
  }
  get status() {
    if (!this.#connected)
      throw new tabNewsError("Você não pode acessar a propriedade status do Client enquanto o Client não está logado.");
    return this.managers.status;
  }
  get users() {
    if (!this.#connected)
      throw new tabNewsError("Você não pode acessar a propriedade users do Client enquanto o Client não está logado.");
    return this.managers.users;
  }
  get user() {
    if (!this.#connected)
      throw new tabNewsError("Você não pode acessar a propriedade user do Client enquanto o Client não está logado.");
    return {
      get: this.managers.user.get,
      edit: this.managers.user.edit,
      ...this.userData,
    };
  }

  /**
   * Conecte seu cliente a uma conta.
   * @param {loginData} loginData
   * @returns {Promise<ClientUserData>}
   * @example
   * client.login({email: "example@example.com", password: "examplePassword"})
   * client.login({token: "my token"})
   */

  async login(loginData) {
    if (this.#connected) this.destroy();

    let token = loginData.token;
    if (!token) token = await this.managers.user.getUserToken(loginData);
    this.#token = token;
    this.REST.setToken(token);

    const user = await this.managers.user.get();

    this.#connected = true;
    this.#loginData = loginData;
    this.#id = user.id;

    this.emit("ready", user);
    return user;
  }
  /**
   * destroi a conexão atual do client
   * @example
   * client.destroy()
   */
  destroy() {
    this.#token = null;
    this.#connected = false;
    this.#id = null;
    this.REST.destroy();

    this.emit("destroyed", this.userData);
    this.userData = {};
  }
}
