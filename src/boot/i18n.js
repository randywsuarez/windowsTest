import Vue from "vue";
import VueI18n from "vue-i18n";
import messages from "src/i18n";
Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: "en-us",
  fallbackLocale: "en-us",
  messages,
});

export default ({ app }) => {
  // Set i18n instance on app
  //Vue.prototype.$t = i18n.t;
  // Establecer la instancia de VueI18n en el objeto app
  app.i18n = i18n;
};

export { i18n };
