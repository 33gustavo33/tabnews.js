import Client from "../../client.js";
import { tabNewsTypeError } from "../../util/error.js";

class BaseManager {
  /** @private @type {Client} */
  client;

  constructor(client) {
    if (client instanceof Client) {
      this.client = client;
    } else {
      throw new tabNewsTypeError("client needs to be a instance of Client");
    }
  }
}

export default BaseManager;
