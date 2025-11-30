import {getConnecterUser, triggerNotConnected} from "../lib/session.js";
import { Redis } from '@upstash/redis';
// const PushNotifications = require("@pusher/push-notifications-server");

const redis = Redis.fromEnv();

export default async (request, response) => {
    try {
        const headers = new Headers(request.headers);
        const user = await getConnecterUser(request);
        if (user === undefined || user === null) {
            console.log("Not connected");
            triggerNotConnected(response);
        }

        const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
        const { content, recipientId } = body;

        if (!content || content.trim() === "") {
            return response.status(400).json({
                error: "Le contenu du message est requis",
                message: "Le contenu du message est requis"
            });
        }

        if (!recipientId) {
            return response.status(400).json({
                error: "Le destinataire est requis",
                message: "Le destinataire est requis"
            });
        }

        const id = Date.now();

        const message = {
            id,
            sender_id: user.user_id,
            recipient_id: recipientId,
            content,
            timestamp: new Date().toISOString()
        };

        await redis.lpush(`chat:${recipientId}`, JSON.stringify(message));
        await redis.ltrim(`chat:${recipientId}`, 0, 99);

        console.log("Message enregistré:", message);

        return response.status(200).json({ success: true, message });

    } catch (error) {
        console.error("Erreur serveur:", error);
        return response.status(500).json({
            error: "Erreur serveur",
            message: error.message || "Erreur lors de l'envoi du message"
        });
    }
};
