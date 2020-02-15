export default class EventEmmiter<T> {
    private listeners: {[key: string] : Array<(...args: any[]) => void> } = {};

    public on(event: Extract<T, string>, callback: (...args: any[]) => void) {
      this.listeners[event] = this.listeners[event] || [];
      this.listeners[event].push(callback);

      return () => {
        this.listeners[event] = this.listeners[event].filter((e) => e !== callback);
      };
    }

    public off(event: Extract<T, string>, callback?: (...args: any[]) => void) {
      if (!this.listeners[event]) {
        return;
      }
      this.listeners[event] = callback
        ? this.listeners[event].filter((e) => e !== callback)
        : [];
    }

    protected trigger(event: Extract<T, string>, ...args: any[]) {
      if (this.listeners[event]) {
        for (let i = 0; i < this.listeners[event].length; i += 1) {
          setTimeout(() => {
            if (this.listeners[event] && this.listeners[event][i]) {
              this.listeners[event][i](...args);
            }
          });
        }
      }
    }
}
