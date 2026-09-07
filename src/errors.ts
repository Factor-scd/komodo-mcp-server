/**
 * Structured error for Komodo API responses.
 * Carries the HTTP status, route, and request name for diagnostics.
 */
export class KomodoApiError extends Error {
  public readonly status: number;
  public readonly route: string;
  public readonly requestName: string;

  constructor(
    message: string,
    status: number,
    route: string,
    requestName: string,
  ) {
    super(message);
    this.name = "KomodoApiError";
    this.status = status;
    this.route = route;
    this.requestName = requestName;
  }
}
