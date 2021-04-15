import { snapshot } from '@app/streams'

// withState :: Stream a -> Stream b -> Stream [a, b]
export const withState = snapshot((state, samplerEvent) => [ state, samplerEvent ])
