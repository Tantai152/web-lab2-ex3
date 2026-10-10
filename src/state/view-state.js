/**
 * Immutable view states supported by the state machine.
 * @type {Readonly<{IDLE: string, LOADING: string, SUCCESS: string, ERROR: string}>}
 */
export const STATUS = Object.freeze({
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
});

const ACTIONS = Object.freeze({
  START_LOAD: 'START_LOAD',
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_ERROR: 'LOAD_ERROR',
  RESET: 'RESET'
});

/**
 * Creates an initial state for IDLE or LOADING.
 * SUCCESS and ERROR must be reached through transition().
 * @param {string} status
 * @returns {Readonly<object>}
 * @throws {Error} If the status is invalid or requires a payload.
 */
export function createViewState(status = STATUS.IDLE) {
  const validStatuses = Object.values(STATUS);

  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  if (status === STATUS.SUCCESS || status === STATUS.ERROR) {
    throw new Error('Use transition() to reach SUCCESS/ERROR');
  }

  return Object.freeze({ status });
}

/**
 * Returns whether an action is valid for a given state.
 * @param {string} fromStatus
 * @param {string} actionType
 * @returns {boolean}
 */
export function isValidTransition(fromStatus, actionType) {
  if (actionType === ACTIONS.RESET) {
    return true;
  }

  if (actionType === ACTIONS.START_LOAD) {
    return (
      fromStatus === STATUS.IDLE ||
      fromStatus === STATUS.SUCCESS ||
      fromStatus === STATUS.ERROR
    );
  }

  if (actionType === ACTIONS.LOAD_SUCCESS || actionType === ACTIONS.LOAD_ERROR) {
    return fromStatus === STATUS.LOADING;
  }

  return false;
}

/**
 * Produces a new frozen state without mutating the current state.
 * @param {Readonly<object>} currentState
 * @param {{type: string, payload?: any}} action
 * @returns {Readonly<object>}
 * @throws {Error} If the transition or action payload is invalid.
 */
export function transition(currentState, action) {
  if (!isValidTransition(currentState.status, action.type)) {
    throw new Error(
      `Invalid transition: ${currentState.status} + ${action.type}`
    );
  }

  switch (action.type) {
    case ACTIONS.RESET:
      return createViewState();

    case ACTIONS.START_LOAD:
      return createViewState(STATUS.LOADING);

    case ACTIONS.LOAD_SUCCESS:
      if (!Array.isArray(action.payload)) {
        throw new Error('LOAD_SUCCESS payload must be an array');
      }

      return Object.freeze({
        status: STATUS.SUCCESS,
        data: action.payload
      });

    case ACTIONS.LOAD_ERROR:
      if (typeof action.payload !== 'string') {
        throw new Error('LOAD_ERROR payload must be a string');
      }

      return Object.freeze({
        status: STATUS.ERROR,
        error: action.payload
      });

    default:
      throw new Error(
        `Invalid transition: ${currentState.status} + ${action.type}`
      );
  }
}
