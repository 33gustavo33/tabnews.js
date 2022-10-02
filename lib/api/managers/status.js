import { Status } from "../../util/types.js";
import Routes from "../Routes.js";
import BaseManager from "./BaseManager.js";

class StatusManager extends BaseManager {
  /**
   * obtém os status do tabnews.
   * @returns {Promise<Status>}
   * @example
   * client.status.get()
   */
  async get() {
    const status = await this.client.REST.get(Routes.status());
    const users = await this.client.REST.get(Routes.usersCreatedAnalytics());
    const root = await this.client.REST.get(Routes.rootContentCreatedAnalytics());
    const child = await this.client.REST.get(Routes.childContentCreatedAnalytics());

    return new Status({ status, users, root, child });
  }
}

export default StatusManager;
