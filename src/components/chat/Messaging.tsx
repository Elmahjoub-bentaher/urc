// src/components/Messaging.tsx
import { useState } from 'react'
import { Box } from '@mui/material'
import { ConversationList } from './ConversationList'
import { MessageList } from './MessageList'



export function Messaging() {


    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            p: 2,
            gap: 2
        }}>
            <ConversationList  />
            <MessageList />
        </Box>
    )
}