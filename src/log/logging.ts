export class Logger {
  /**
   * Log a info message.
   * @param message message to lo
   */
  static info(
    message: string
  ): void {
    console.log(message);
  }

  /**
   * Log a error message.
   * @param message message to lo
   */
  static error(
    message: string
  ): void {
    console.error(message);
  }
}