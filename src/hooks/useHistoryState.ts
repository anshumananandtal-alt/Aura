import { useReducer } from 'react'

type HistoryAction<T> =
  | { type: 'SET'; payload: T | ((prev: T) => T) }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; payload: T }

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
  limit: number
}

const historyReducer = <T,>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> => {
  switch (action.type) {
    case 'SET': {
      const nextPresent =
        typeof action.payload === 'function'
          ? (action.payload as (prev: T) => T)(state.present)
          : action.payload
      if (nextPresent === state.present) {
        return state
      }
      const past = [...state.past, state.present].slice(-state.limit)
      return { past, present: nextPresent, future: [] , limit: state.limit }
    }
    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      const past = state.past.slice(0, -1)
      return { past, present: previous, future: [state.present, ...state.future], limit: state.limit }
    }
    case 'REDO': {
      if (state.future.length === 0) return state
      const [next, ...future] = state.future
      return { past: [...state.past, state.present].slice(-state.limit), present: next, future, limit: state.limit }
    }
    case 'RESET': {
      return { past: [], present: action.payload, future: [], limit: state.limit }
    }
    default:
      return state
  }
}

export function useHistoryState<T>(initialState: T, limit = 60) {
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialState,
    future: [],
    limit,
  } as HistoryState<T>)

  const set = (value: T | ((prev: T) => T)) => dispatch({ type: 'SET', payload: value })
  const undo = () => dispatch({ type: 'UNDO' })
  const redo = () => dispatch({ type: 'REDO' })
  const reset = (value: T) => dispatch({ type: 'RESET', payload: value })

  return {
    present: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  }
}
