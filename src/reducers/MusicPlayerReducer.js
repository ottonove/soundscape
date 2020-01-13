export const MusicPlayerReducer = (state, action) => {
    switch (action.type) {
        case 'startRandomize':
            return {
                ...state,
                randomize: true
            };
        case 'stopRandomize':
            return {
                ...state,
                randomize: false
            };
        case 'addPlayer':
            return {
                ...state,
                players: [...state.players, action.payload]
            };
        case 'mute':
            return {
                ...state,
                mute: true
            };
        case 'unmute':
            return {
                ...state,
                mute: false
            };
        case 'addEffect':
            switch (action.payload.effectType) {
                case 'highpass':
                    return {
                        ...state,
                        groupEffects: {
                            ...state.groupEffects,
                            highpass: [...state.groupEffects.highpass, action.payload.effect]
                        }
                    };
                case 'lowpass':
                    return {
                        ...state,
                        groupEffects: {
                            ...state.groupEffects,
                            lowpass: [...state.groupEffects.lowpass, action.payload.effect]
                        }
                    };
                case 'reverb-dry':
                    return {
                        ...state,
                        groupEffects: {
                            ...state.groupEffects,
                            reverbDry: [...state.groupEffects.reverbDry, action.payload.effect]
                        }
                    };
                case 'reverb-wet':
                    return {
                        ...state,
                        groupEffects: {
                            ...state.groupEffects,
                            reverbWet: [...state.groupEffects.reverbWet, action.payload.effect]
                        }
                    };
            }
    }
}