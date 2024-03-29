// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { onMount } from 'svelte'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
export const mounted = {
  subscribe (fn) {
    fn(false)
    onMount(() => fn(true))
    return () => {}
  }
}

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
