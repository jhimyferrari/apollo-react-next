export type AuthSyncEvent = "login" | "logout" | "session-updated";

const AUTH_CHANNEL_NAME = "apollo-auth";
const AUTH_WINDOW_EVENT = "apollo-auth-event";

export function broadcastAuthEvent(type: AuthSyncEvent): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<AuthSyncEvent>(AUTH_WINDOW_EVENT, { detail: type }));

  if (typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.postMessage(type);
      channel.close();
    } catch {
      // BroadcastChannel indisponível em contextos restritos
    }
  }
}

export function subscribeAuthEvents(
  listener: (type: AuthSyncEvent) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleWindowEvent = (event: Event) => {
    const customEvent = event as CustomEvent<AuthSyncEvent>;
    if (customEvent.detail) {
      listener(customEvent.detail);
    }
  };

  window.addEventListener(AUTH_WINDOW_EVENT, handleWindowEvent);

  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    try {
      channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent<AuthSyncEvent>) => {
        if (event.data) {
          listener(event.data);
        }
      };
    } catch {
      channel = null;
    }
  }

  return () => {
    window.removeEventListener(AUTH_WINDOW_EVENT, handleWindowEvent);
    channel?.close();
  };
}
