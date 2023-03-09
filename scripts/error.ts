import { STATUS_TEXT } from "./http_status.ts";
export function errorToResponse(e: Error | HTTPError) {
  const bodyJson = {
    ok: false,
    error: "Internal Server Error",
    message: "Internal Server Error",
  };
  let status = 500;
  let statusText = "Internal Server Error";

  if (e instanceof Error) {
    const error = e as HTTPError;
    bodyJson.message = error.message;
    bodyJson.error = error.name;

    if (error.status) {
      status = error.status;
    }
    if (error.statusText) {
      statusText = error.statusText;
    }
  }
  return new Response(JSON.stringify(bodyJson, null, 2), {
    status: status,
    statusText: statusText,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export class HTTPError extends Error {
  status: number;
  statusText: string;
  constructor(name: string, message: string, status: number) {
    super(message);
    this.name = name;
    this.status = status;
    // @ts-ignore: it's ok
    this.statusText = STATUS_TEXT[status];
  }
}
