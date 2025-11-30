// src/pages/api/register.js
import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import {arrayBufferToBase64, stringToArrayBuffer} from "../lib/base64";


export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            const error = { code: "MISSING_FIELDS", message: "Tous les champs sont obligatoires" };
            return new Response(JSON.stringify(error), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            });
        }

        if (password.length < 6) {
            const error = { code: "PASSWORD_TOO_SHORT", message: "Le mot de passe doit contenir au moins 6 caractères" };
            return new Response(JSON.stringify(error), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            });
        }

        const client = await db.connect();

        const existingUser = await client.sql`SELECT user_id FROM users WHERE username = ${username}`;
        if (existingUser.rowCount > 0) {
            const error = { code: "USERNAME_EXISTS", message: "Ce nom d'utilisateur est déjà utilisé" };
            return new Response(JSON.stringify(error), {
                status: 409,
                headers: { 'content-type': 'application/json' },
            });
        }

        const existingEmail = await client.sql`SELECT user_id FROM users WHERE email = ${email}`;
        if (existingEmail.rowCount > 0) {
            const error = { code: "EMAIL_EXISTS", message: "Cet email est déjà utilisé" };
            return new Response(JSON.stringify(error), {
                status: 409,
                headers: { 'content-type': 'application/json' },
            });
        }

        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);

        const external_id = crypto.randomUUID().toString();

        const result = await client.sql`
            INSERT INTO users (username, email, password, external_id, created_on ) 
            VALUES (${username}, ${email}, ${hashed64}, ${external_id}, NOW())
            RETURNING user_id, username, email, external_id
        `;

        if (result.rowCount === 1) {
            const newUser = result.rows[0];

            const token = crypto.randomUUID().toString();
            const user = {
                id: newUser.user_id,
                username: newUser.username,
                email: newUser.email,
                externalId: newUser.external_id
            };

            await redis.set(token, user, { ex: 3600 });
            const userInfo = {};
            userInfo[user.id] = user;
            await redis.hset("users", userInfo);

            return new Response(JSON.stringify({
                token: token,
                username: username,
                externalId: newUser.external_id,
                id: newUser.user_id
            }), {
                status: 201,
                headers: { 'content-type': 'application/json' },
            });
        } else {
            const error = { code: "REGISTRATION_FAILED", message: "Erreur lors de l'inscription" };
            return new Response(JSON.stringify(error), {
                status: 500,
                headers: { 'content-type': 'application/json' },
            });
        }

    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}