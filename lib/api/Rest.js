import fetch, { Headers } from "node-fetch";
import { tabNewsValidationError } from "../util/error.js";
import validator from "../util/validator.js";
import default_config from "../config.js";

class REST {
  #config;
  #token = "";
  #tabnewsApiVersion = 1;
  #tabnewsJsRestVersion = 1.2;
  logger;

  constructor(config, logger) {
    this.logger = logger;
    this.#config = validator.validateConfig(config, default_config);
  }

  setToken(token) {
    if (token.length !== 96) throw new tabNewsValidationError("token needs to be 96 characters long");
    this.#token = token;
  }

  destroy() {
    this.#token = null;
  }

  get token() {
    return this.#token;
  }

  /**
   * faz um request com o método GET
   * @param {string} route
   * @param {object} [requestOptions]
   * @param {object} requestOptions.body
   */
  get(route, requestOptions) {
    return this._request(route, { method: "GET", body: requestOptions?.body });
  }

  /**
   * faz um request com o método POST
   * @param {string} route
   * @param {object} [requestOptions]
   * @param {object} requestOptions.body
   */
  post(route, requestOptions) {
    return this._request(route, { method: "POST", body: requestOptions?.body });
  }

  /**
   * faz um request com o método PATCH
   * @param {string} route
   * @param {object} [requestOptions]
   * @param {object} requestOptions.body
   */
  patch(route, requestOptions) {
    return this._request(route, {
      method: "PATCH",
      body: requestOptions?.body,
    });
  }

  /** @private */
  _buildRequestConfig({ method, token, body }) {
    const headers = new Headers();
    const config = {};

    headers.set(
      "user-agent",
      `Mozilla/5.0 (compatible; Tabnews.js/${this.#tabnewsJsRestVersion}; ${this.#config.agentUser ?? "default"})`
    );
    if (this.#token) headers.set("cookie", `session_id=${this.#token}`);
    if (token) headers.set("cookie", `session_id=${token}`);
    if (body) {
      headers.set("content-type", "application/json");
      config.body = JSON.stringify(body);
    }

    config.headers = headers;
    config.method = method;
    return config;
  }

  /** @private */
  _buildRequestUrl(route) {
    return `${this.#config.tabnewsUrl}/api/v${this.#tabnewsApiVersion}${route}`;
  }

  /**
   * @private
   * @returns {object}
   */
  async _request(route, requestOptions) {
    const url = this._buildRequestUrl(route);
    const config = this._buildRequestConfig(requestOptions);

    this.logger?.logRequest(url, config);

    const response = await fetch(url, config);
    const responseData = await response.json();

    if (!response.ok) throw { response, responseData, config, url };

    return responseData;
  }
}

export default REST;
