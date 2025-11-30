import { Session, SessionCallback, ErrorCallback, User } from "../model/common";
import { CustomError } from "../model/CustomError";

export function registerUser(user: { username: string; email: string; password: string }, onResult: SessionCallback, onError: ErrorCallback) {
    fetch("/api/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        })
        .then(async (response) => {
            if (response.ok) {
                const session = await response.json() as Session;
                onResult(session);
            } else {
                const error = await response.json() as CustomError;
                onError(error);
            }
        })
        .catch((error) => {
            onError({
                name: 'NetworkError',
                message: 'Erreur de réseau',
                status: 0
            } as CustomError);
        });
}