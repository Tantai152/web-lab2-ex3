/**
 * Entry point for Exercise 3.
 * Mounts DataFeed and initializes the event delegation hub.
 */
import { DataFeed } from './app/data-feed.js';

const rootContainer = document.getElementById('app');

if (!rootContainer) {
  const status = document.getElementById('status');

  if (status) {
    status.textContent = '✗ Missing #app container';
  }

  throw new Error('Missing #app');
}

function renderFeed() {
  const tree = DataFeed({
    onStateChange: () => {
      // Re-render after the current DOM update settles.
      queueMicrotask(() => renderFeed());
    }
  });

  rootContainer.replaceChildren(tree);
}

const SUPPORTED_EVENTS = ['click', 'input', 'keydown'];
let delegationSetup = false;

function setupDelegation() {
  if (delegationSetup) {
    return;
  }

  delegationSetup = true;

  SUPPORTED_EVENTS.forEach((eventType) => {
    const handlerProp =
      'on' + eventType.charAt(0).toUpperCase() + eventType.slice(1);

    rootContainer.addEventListener(eventType, (nativeEvent) => {
      let target = nativeEvent.target;

      while (target && target !== rootContainer) {
        if (
          target._vnode &&
          target._vnode.props &&
          typeof target._vnode.props[handlerProp] === 'function'
        ) {
          target._vnode.props[handlerProp](nativeEvent);
          return;
        }

        target = target.parentElement;
      }
    });
  });
}

renderFeed();
setupDelegation();

const status = document.getElementById('status');

if (status) {
  status.textContent = '✓ Data feed mounted';
}
