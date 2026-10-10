import { STATUS, createViewState, transition } from '../state/view-state.js';

let currentState = createViewState();
let currentRequestId = 0;

/**
 * Focus management after state transitions for accessibility.
 * - On transition to ERROR: focus the Retry button so screen readers announce it immediately.
 * - On transition from ERROR to LOADING: blur the (now removed) Retry button by focusing the root.
 * @param {string} prevStatus - Previous status before transition.
 * @param {string} nextStatus - New status after transition.
 * @param {HTMLElement} rootEl - Root element of the DataFeed component.
 */
function focusAfterTransition(prevStatus, nextStatus, rootEl) {
  if (prevStatus !== STATUS.ERROR && nextStatus === STATUS.ERROR) {
    const retryBtn = rootEl.querySelector('.data-feed__retry');
    if (retryBtn) retryBtn.focus();
  } else if (prevStatus === STATUS.ERROR && nextStatus === STATUS.LOADING) {
    rootEl.focus();
  }
}

/**
 * Updates the current state and notifies the state-change callback.
 * @param {object} nextState
 * @param {Function} [onStateChange]
 */
function setState(nextState, onStateChange) {
  const prevStatus = currentState.status;
  currentState = nextState;

  if (typeof onStateChange === 'function') {
    onStateChange(currentState);
  }

  queueMicrotask(() => {
    const rootEl = document.querySelector('.data-feed');
    if (rootEl) {
      focusAfterTransition(prevStatus, currentState.status, rootEl);
    }
  });
}

/**
 * Simulates an asynchronous data request with a 30% failure rate.
 * @returns {Promise<Array<{id: string, title: string, value: string|number}>>}
 */
function mockFetch() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.3) {
        reject(new Error('Mạng không ổn định — vui lòng thử lại'));
        return;
      }

      const data = Array.from({ length: 5 }, (_, index) => ({
        id: crypto.randomUUID(),
        title: `Item ${index + 1}`,
        value: Math.floor(Math.random() * 100) + 1
      }));

      resolve(data);
    }, 1500);
  });
}

/**
 * Loads data and ignores responses from outdated requests.
 * @param {Function} [onStateChange]
 * @returns {Promise<void>}
 */
async function loadData(onStateChange) {
  currentRequestId += 1;
  const myRequestId = currentRequestId;

  setState(
    transition(currentState, { type: 'START_LOAD' }),
    onStateChange
  );

  try {
    const data = await mockFetch();

    if (myRequestId !== currentRequestId) {
      return;
    }

    setState(
      transition(currentState, {
        type: 'LOAD_SUCCESS',
        payload: data
      }),
      onStateChange
    );
  } catch (err) {
    if (myRequestId !== currentRequestId) {
      return;
    }

    setState(
      transition(currentState, {
        type: 'LOAD_ERROR',
        payload: err.message
      }),
      onStateChange
    );
  }
}

/**
 * Creates the Data Feed UI for the current view state.
 * @param {{onStateChange?: Function}} [options]
 * @returns {HTMLElement}
 */
export function DataFeed({ onStateChange } = {}) {
  const root = document.createElement('section');
  root.className = 'data-feed';
  root.setAttribute('tabindex', '-1');
  root.setAttribute('aria-live', 'polite');
  root.setAttribute(
    'aria-busy',
    currentState.status === STATUS.LOADING ? 'true' : 'false'
  );

  const heading = document.createElement('h2');
  heading.textContent = 'Data Feed';
  root.appendChild(heading);

  const createActionButton = (label, className, action, dataAction) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;

    if (dataAction) {
      button.setAttribute('data-action', dataAction);
    }

    button.disabled = currentState.status === STATUS.LOADING;

    button._vnode = {
      props: {
        onClick: action
      }
    };

    return button;
  };

  switch (currentState.status) {
    case STATUS.IDLE: {
      root.appendChild(
        createActionButton(
          'Load Data',
          'data-feed__load',
          () => loadData(onStateChange)
        )
      );
      break;
    }

    case STATUS.LOADING: {
      const list = document.createElement('ul');
      list.className = 'data-feed__skeleton';
      list.setAttribute('aria-label', 'Đang tải dữ liệu');

      for (let index = 0; index < 5; index += 1) {
        const item = document.createElement('li');
        item.className = 'skeleton skeleton--pulse';
        item.setAttribute('aria-hidden', 'true');
        list.appendChild(item);
      }

      root.appendChild(list);
      break;
    }

    case STATUS.SUCCESS: {
      const list = document.createElement('ul');
      list.className = 'data-feed__list';

      for (const dataItem of currentState.data) {
        const item = document.createElement('li');
        item.setAttribute('data-item-id', dataItem.id);

        const article = document.createElement('article');
        const title = document.createElement('h3');
        const value = document.createElement('p');

        title.textContent = dataItem.title;
        value.textContent = String(dataItem.value);

        article.appendChild(title);
        article.appendChild(value);
        item.appendChild(article);
        list.appendChild(item);
      }

      root.appendChild(list);

      root.appendChild(
        createActionButton(
          'Reload',
          'data-feed__load',
          () => loadData(onStateChange)
        )
      );
      break;
    }

    case STATUS.ERROR: {
      const errorMessage = document.createElement('p');
      errorMessage.setAttribute('role', 'alert');
      errorMessage.className = 'data-feed__error';

      const fullError = String(currentState.error || 'Unknown error');
      const safeMessage = fullError.slice(0, 200);
      errorMessage.textContent = safeMessage;

      if (fullError.length > 200) {
        errorMessage.setAttribute('title', fullError);
      }

      root.appendChild(errorMessage);

      root.appendChild(
        createActionButton(
          'Retry Connection',
          'data-feed__retry',
          () => loadData(onStateChange),
          'retry'
        )
      );
      break;
    }
  }

  return root;
}