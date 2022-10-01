class tabNewsError extends Error {
  constructor(message) {
    super(message);
    this.name = "Tabnews.js Error";
  }
}

class tabNewsTypeError extends tabNewsError {
  constructor(message) {
    super(message);
    this.name = "Tabnews.js TypeError";
  }
}

class tabNewsValidationError extends tabNewsError {
  constructor(message) {
    super(message);
    this.name = "Tabnews.js ValidationError";
  }
}

class tabNewsHttpError extends tabNewsError {
  constructor(message, url) {
    super(message);
    this.name = "Tabnews.js HTTP Error";
    this.url = url;
  }
}

export { tabNewsHttpError, tabNewsTypeError, tabNewsError, tabNewsValidationError };
