// Patch for CloseEvent
// https://github.com/honojs/middleware/issues/595#issuecomment-2196318895

globalThis.CloseEvent = class CloseEvent extends Event {
  constructor(type: string, eventInitDict: any = {}) {
    super(type, eventInitDict);

    if (eventInitDict.wasClean) this.wasClean = eventInitDict.wasClean;
    if (eventInitDict.code) this.code = eventInitDict.code;
    if (eventInitDict.reason) this.reason = eventInitDict.reason;
  }

  wasClean = false;
  code = 0;
  reason = "";
};
