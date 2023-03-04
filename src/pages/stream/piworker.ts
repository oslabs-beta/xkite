// This is a module worker, so we can use imports (in the browser too!)
import pi from './pi';

addEventListener('message', (event: MessageEvent<number>) => {
  postMessage(pi(event.data));
});
