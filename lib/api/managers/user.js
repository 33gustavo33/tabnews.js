import { ClientUserData } from "../../util/types.js";
import Routes from "../Routes.js";
import BaseManager from "./BaseManager.js";

class UserManager extends BaseManager {
  /** @private */
  async getUserToken(loginData) {
    const session = await this.client.REST.post(Routes.session(), {
      body: loginData,
    });

    return session.token;
  }

  /**
   * @returns {Promise<ClientUserData>}
   * @example
   * client.user.get()
   */
  async get() {
    const user = await this.client.REST.get(Routes.user());
    const userData = new ClientUserData(user, this.client.REST.token, this.client);

    this.client.userData = userData;

    return this.client.userData;
  }

  /**
   * edita o usuario do client
   * @param {object} options
   * @param {string} [options.username]
   * @returns {Promise<ClientUserData>}
   * @example
   * client.user.edit({username: "Novo username"})
   */
  async edit(options) {
    const userPatched = await this.client.REST.patch(Routes.users(this.client.userData.username), { body: options });
    const user = await this.get();

    return user;
  }
}

export default UserManager;
