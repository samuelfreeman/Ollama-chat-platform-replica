import {create  } from 'zustand';

export const messageCountStore = create((set => ({
count: 0,
increment :() =>set ((state:any) => ({ count :state.count + 1})),
clearCount :() => set ({ count :0})

})))





// interface CheckCountState {
//     messageCount: number;
//     incrementCount: () => void;
//     resetCount: () => void;
// }

// export const useCheckCount = create<CheckCountState>((set) => ({
//     messageCount: 0,
//     incrementCount: () => set((state) => ({ messageCount: state.messageCount + 1 })),
//     resetCount: () => set({ messageCount: 0 }),
// }));