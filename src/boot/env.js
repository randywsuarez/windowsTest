import env from "../utils/env";

export default ({ Vue }) => {
  Vue.prototype.$env = env;
};
