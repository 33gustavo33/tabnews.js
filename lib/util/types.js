import { tabNewsHttpError, tabNewsTypeError } from "./error.js";
import Client from "../client.js";
import Routes from "../api/Routes.js";

function toJSON(object) {
  const blockedNames = ["client"];

  for (const [key] of Object.entries(object)) {
    if (blockedNames.includes(key) || key.startsWith("_")) {
      delete object[key];
    }
  }

  return JSON.parse(JSON.stringify(object));
}

function getAverage(numbers) {
  let result = 0;
  numbers.forEach((number) => {
    result += parseFloat(number) || 0;
  });
  return result > 0 ? result / numbers.length : result;
}

class Structure {
  #raw = {};
  /** @private @type {Client}*/
  client;

  constructor(data, client, disableClient) {
    if (!data || typeof data !== "object") throw new tabNewsTypeError("Data needs to be an object");
    this.#raw = data;

    if (disableClient) return;

    if (!(client instanceof Client)) throw new tabNewsTypeError("client needs to be an Client");

    Object.defineProperty(this, "client", {
      value: client,
      writable: false,
    });
  }

  toJSON() {
    return toJSON({ ...this });
  }

  getRaw() {
    return this.#raw;
  }
}

class UserData extends Structure {
  /** @type {string} */
  id;
  /** @type {string} */
  username;
  /** @type {Array<string>} */
  features = [];
  /** @type {number} */
  tabcoins;
  /** @type {number} */
  tabcash;
  /** @type {Date} */
  created_at;
  /** @type {Date} */
  updated_at;

  constructor(data, client) {
    super(data, client);
    this.updateUserData(data);
  }

  /**
   * @param {"new" | "old" | "relevant"} [strategy]
   * @param {number} [page]
   * @return {Promise<Content[]>}
   * @example
   * user.getContents("old")
   */
  getContents(strategy = "new", page = 1) {
    return this.client.managers.users.getContentsOfUser(this.username, strategy, page);
  }

  /** @private */
  updateUserData({ username, features, tabcoins, tabcash, created_at, updated_at, id }) {
    if (typeof id == "string") this.id = id;
    if (typeof username == "string") this.username = username;
    if (Array.isArray(features)) this.features = features;
    if (typeof tabcoins == "number") this.tabcoins = tabcoins;
    if (typeof tabcash == "number") this.tabcash = tabcash;
    if (typeof created_at == "string") this.created_at = new Date(created_at);
    if (typeof updated_at == "string") this.updated_at = new Date(updated_at);
  }
}

class ClientUserData extends UserData {
  /** @type {string} */
  email;
  /** @type {string} */
  token;

  constructor(data, token, client) {
    super(data, client);
    this.updateClientUserData(data, token);
  }

  /** @private */
  updateClientUserData({ username, features, tabcoins, tabcash, created_at, updated_at, id, email }, token) {
    this.updateUserData({
      username,
      features,
      tabcoins,
      tabcash,
      created_at,
      updated_at,
      id,
    });
    if (typeof email == "string") this.email = email;
    if (typeof token == "string") this.token = token;
  }
}

class Content extends Structure {
  /** @type {string} */
  id;
  /** @type {string} */
  parent_id;
  /** @type {string} */
  slug;
  /** @type {string} */
  title;
  /** @type {string} */
  body;
  /** @type {string} */
  status;
  /** @type {string} */
  source_url;
  /**
   * @typedef owner;
   * @property {string} id
   * @property {string} username
   */
  /** @type {owner} */
  owner = {};
  /** @type {number} */
  tabcoins;
  /** @type {number} */
  children_deep_count = 0;
  /** @type {Date} */
  created_at;
  /** @type {Date} */
  published_at;
  /** @type {Date} */
  updated_at;
  /** @type {Date} */
  deleted_at;
  /** @type {boolean} */
  is_children = false;
  /** @type {boolean} */
  is_root = true;
  /** @type {boolean} */
  has_children = false;
  /** @type {string} */
  thumbnail;

  constructor(data, client) {
    super(data, client);
    this.updateContent(data);
  }

  /**
   * @returns {Promise<UserData>}
   */
  fetchOwner() {
    return this.client.managers.users.get(this.owner.username);
  }

  /**
   * @returns {Promise<Content>}
   */
  async fetchParent() {
    if (this.is_root) return this;
    return await this.client.managers.contents.getContentParent(this.owner.username, this.slug);
  }

  /**
   * @returns {Promise<[Content]>}
   */
  async fetchChildren() {
    if (!this.has_children) return [];
    return await this.client.managers.contents.getContentChildren(this.owner.username, this.slug);
  }

  /**
   * @returns {Promise<Content>}
   * @example
   * content.delete()
   */
  delete() {
    return this.client.managers.contents.delete(this.owner.username, this.slug);
  }

  /**
   * @returns {Promise<Content>}
   * @example
   * content.upvote()
   */
  async upvote() {
    const contentUpvoted = this.client.managers.contents.upvote(this.owner.username, this.slug);
    if (contentUpvoted.tabcoins) this.tabcoins = contentUpvoted.tabcoins;
    return this;
  }

  /**
   * @returns {Promise<Content>}
   * @example
   * content.downvote()
   */
  async downvote() {
    const contentDownvoted = await this.client.managers.contents.downvote(this.owner.username, this.slug);
    if (contentDownvoted.tabcoins) this.tabcoins = contentDownvoted.tabcoins;
    return this;
  }

  /**
   * @param {object} content
   * @param {string} [content.title]
   * @param {string} [content.body]
   * @param {string} [content.sourceUrl]
   * @returns {Promise<Content>}
   * @example
   * content.edit({title: "Novo titulo"})
   */
  async edit(content) {
    const contentEdited = await this.client.managers.contents.edit(this.owner.username, this.slug, content);
    this.updateContent(contentEdited.getRaw());
    return this;
  }

  /** @private */
  updateContent({
    id,
    owner_id,
    parent_id,
    title,
    body,
    status,
    owner_username,
    source_url,
    slug,
    created_at,
    published_at,
    updated_at,
    deleted_at,
    tabcoins,
    children_deep_count,
  }) {
    if (typeof id == "string") this.id = id;
    if (typeof owner_id == "string" && typeof owner_username == "string")
      this.owner = { id: owner_id, username: owner_username };
    if (typeof parent_id == "string") {
      this.parent_id = parent_id;
      this.is_children = true;
      this.is_root = false;
    }
    if (typeof title == "string") this.title = title;
    if (typeof body == "string") this.body = body;
    if (typeof status == "string") this.status = status;
    if (typeof source_url == "string") this.source_url = source_url;
    if (typeof slug == "string") this.slug = slug;
    if (typeof created_at == "string") this.created_at = new Date(created_at);
    if (typeof published_at == "string") this.published_at = new Date(published_at);
    if (typeof updated_at == "string") this.updated_at = new Date(updated_at);
    if (typeof deleted_at == "string") this.deleted_at = new Date(deleted_at);
    if (typeof tabcoins == "number") this.tabcoins = tabcoins;
    if (typeof children_deep_count == "number") {
      this.children_deep_count = children_deep_count;
      if (children_deep_count > 0) this.has_children = true;
    }
    if (this.slug && this.owner.username)
      this.thumbnail = this.client.REST._buildRequestUrl(Routes.contentThumbnail(this.owner.username, this.slug));
  }
}

class DatabaseStatus extends Structure {
  /** @type {Array<number>} */
  latency = [];
  /** @type {number} */
  maxConnections = 0;
  /** @type {number} */
  openedConnections = 0;
  /** @type {number} */
  averageLatency = 0;
  /** @type {("healthy" | "unhealthy")}  */
  status = "";
  /** @type {string} */
  postgreVersion = "";

  constructor(data) {
    super(data, null, true);
    let { latency, max_connections, opened_connections, status, version } = data;
    if (typeof latency == "object") {
      for (let [key, ms] of Object.entries(latency)) {
        this.latency.push(ms);
      }
      this.averageLatency = getAverage(this.latency);
    }
    if (typeof max_connections == "number") this.maxConnections = max_connections;
    if (typeof opened_connections == "number") this.openedConnections = opened_connections;
    if (typeof status == "string") this.status = status;
    if (typeof version == "string") this.postgreVersion = version;
  }
}

class WebServerStatus extends Structure {
  /** @type {string} */
  awsRegion;
  /** @type {("local" | "preview" | "production")}  */
  environment;
  /** @type {string} */
  lastCommitAuthor;
  /** @type {string} */
  lastCommitMessage;
  /** @type {string} */
  lastCommitMessageSha;
  /** @type {("vercel" | "local")}  */
  provider;
  /** @type {("healthy" | "unhealthy")}  */
  status;
  /** @type {string} */
  timezone;
  /** @type {string} */
  vercelRegion;
  /** @type {string} */
  nodejsVersion;

  constructor(data) {
    super(data, null, true);
    let {
      status,
      version,
      provider,
      environment,
      aws_region,
      vercel_region,
      timezone,
      last_commit_author,
      last_commit_message,
      last_commit_message_sha,
    } = data;
    if (typeof status == "string") this.status = status;
    if (typeof version == "string") this.nodejsVersion = version;
    if (typeof provider == "string") this.provider = provider;
    if (typeof environment == "string") this.environment = environment;
    if (typeof aws_region == "string") this.awsRegion = aws_region;
    if (typeof vercel_region == "string") this.vercelRegion = vercel_region;
    if (typeof timezone == "string") this.timezone = timezone;
    if (typeof last_commit_author == "string") this.lastCommitAuthor = last_commit_author;
    if (typeof last_commit_message == "string") this.lastCommitMessage = last_commit_message;
    if (typeof last_commit_message_sha == "string") this.lastCommitMessageSha = last_commit_message_sha;
  }
}

class Analytics extends Structure {
  /**
   * @typedef {object} AnalyticsDay
   * @property {string} date
   * @property {number} created
   */

  /** @type {Array<AnalyticsDay>} */
  usersCreated = [];
  /** @type {Array<AnalyticsDay>} */
  rootContentCreated = [];
  /** @type {Array<AnalyticsDay>} */
  childContentCreated = [];

  constructor(data) {
    super(data, null, true);
    let { users, root, child } = data;
    if (Array.isArray(users)) {
      users.forEach(({ date, cadastros }) => {
        if (typeof date == "string" && typeof cadastros == "number")
          this.usersCreated.push({ date, created: cadastros });
      });
    }
    if (Array.isArray(root)) {
      root.forEach(({ date, conteudos }) => {
        if (typeof date == "string" && typeof conteudos == "number")
          this.rootContentCreated.push({ date, created: conteudos });
      });
    }
    if (Array.isArray(child)) {
      child.forEach(({ date, respostas }) => {
        if (typeof date == "string" && typeof respostas == "number")
          this.childContentCreated.push({ date, created: respostas });
      });
    }
  }
}

class Status extends Structure {
  /** @type {DatabaseStatus} */
  database;
  /** @type {WebServerStatus}} */
  webserver;
  /** @type {Analytics} */
  analytics;

  constructor(data) {
    super(data, null, true);
    let { status, users, root, child } = data;
    if (typeof status == "object") {
      if (typeof status.dependencies == "object") {
        if (status.dependencies.database) this.database = new DatabaseStatus(status.dependencies.database);
        if (status.dependencies.webserver) this.webserver = new WebServerStatus(status.dependencies.webserver);
      }
    }
    if (users || root || child) this.analytics = new Analytics({ users, root, child });
  }
}

export { UserData, ClientUserData, Content, DatabaseStatus, WebServerStatus, Analytics, Status };
