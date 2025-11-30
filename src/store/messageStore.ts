// src/stores/messageStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    user_id: number
    username: string
    last_login: string
}

interface Message {
    id: number
    sender_id: number
    content: string
    timestamp: Date
}

interface MessageState {
    // État
    selectedUser: User | null
    conversations: { [userId: number]: Message[] } // Historique des conversations
    messages: Message[]

    // Actions
    selectUser: (user: User) => void
    clearSelection: () => void
    addMessage: (message: Message) => void
}

export const useMessageStore = create<MessageState>()(
    persist(
        (set, get) => ({
            // État initial
            selectedUser: null,
            conversations: {},
            messages: [],

            // Actions
            selectUser: (user: User) => {
                const { conversations } = get()

                set({
                    selectedUser: user,
                    messages: conversations[user.user_id] || []
                })
            },

            clearSelection: () => {
                set({
                    selectedUser: null,
                    messages: []
                })
            },

            addMessage: (message: Message) => {
                const { selectedUser, conversations } = get()

                if (!selectedUser) return

                set(state => ({
                    messages: [...state.messages, message]
                }))

                set(state => ({
                    conversations: {
                        ...state.conversations,
                        [selectedUser.user_id]: [...(state.conversations[selectedUser.user_id] || []), message]
                    }
                }))

                console.log('💬 Message ajouté:', message.content)
            },

            clearMessages: () => {
                set({ messages: [] })
            },

            loadConversation: (userId: number) => {
                const { conversations } = get()
                set({
                    messages: conversations[userId] || []
                })
            }
        }),
        {
            name: 'message-storage',
            partialize: (state) => ({
                selectedUser: state.selectedUser,
                conversations: state.conversations
            })
        }
    )
)