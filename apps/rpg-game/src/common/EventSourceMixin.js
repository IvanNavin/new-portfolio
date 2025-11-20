export default {
  pushEvent(event, sub) {
    const subs = this.subscribers || (this.subscribers = {});
    (subs[event] || (subs[event] = [])).push(sub);
  },

  on(event, callback) {
    this.pushEvent(event, [true, callback]);
  },

  once(event, callback) {
    this.pushEvent(event, [false, callback]);
  },

  un(event, callback) {
    const subs = this.subscribers;
    if (subs && subs[event]) subs[event] = subs[event].filter((sub) => sub !== callback);
  },

  trigger(event, data = null) {
    const subs = this.subscribers;
    if (subs && subs[event]) {
      // call all handlers
      subs[event].forEach((sub) => sub[1](event, data, this));
      // remove all one-time handlers
      subs[event] = subs[event].filter((sub) => sub[0]);
    }
  },
};
